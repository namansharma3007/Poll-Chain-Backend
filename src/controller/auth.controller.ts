import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { hashPassword, comparePassword, testEmail } from "../lib/utilities";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import jwt, { JwtPayload, type SignOptions } from "jsonwebtoken";

const generateAccessToken = (userId: string): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new ApiError(500, "ACCESS_TOKEN_SECRET not configured");

  const expiry = process.env.ACCESS_TOKEN_EXPIRY;
  if (!expiry) throw new ApiError(500, "ACCESS_TOKEN_EXPIRY not configured");

  const options: SignOptions = {
    expiresIn: Number(expiry),
  };

  return jwt.sign({ userId }, secret, options);
};

const generateRefreshToken = (userId: string): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new ApiError(500, "REFRESH_TOKEN_SECRET not configured");

  const expiry = process.env.REFRESH_TOKEN_EXPIRY;
  if (!expiry) throw new ApiError(500, "ACCESS_TOKEN_EXPIRY not configured");

  const options: SignOptions = {
    expiresIn: Number(expiry),
  };

  return jwt.sign({ userId }, secret, options);
};

const signup = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    throw new ApiError(400, "Missing required fields");
  }

  if (!testEmail(email)) {
    throw new ApiError(400, "Invalid email");
  }

  if (username.length < 6 || username.length > 20) {
    throw new ApiError(400, "Username must be between 6 and 20 characters");
  }

  if (password.length < 6 || password.length > 20) {
    throw new ApiError(400, "Password must be between 6 and 20 characters");
  }

  if (await User.exists({ username })) {
    throw new ApiError(400, "Username already exists");
  }
  if (await User.exists({ email })) {
    throw new ApiError(400, "Email already exists");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  let avatar = process.env.DEFAULT_AVATAR_URL;
  let avatarPublicId: string | null = null;

  if (req.file) {
    const file = req.file as Express.Multer.File;
    const cloudinaryResponse = await uploadOnCloudinary(file.path);
    if (!cloudinaryResponse) throw new ApiError(500, "Avatar upload failed");
    avatar = cloudinaryResponse.secure_url;
    avatarPublicId = cloudinaryResponse.public_id;
  }

  if (!avatar) throw new ApiError(500, "Default avatar URL not configured");

  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    avatar,
    avatarPublicId,
  });

  await newUser.save();

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken -avatarPublicId"
  );

  if (!createdUser) throw new ApiError(500, "User creation failed");

  res
    .status(201)
    .json(new ApiResponse(201, "Account created successfully", createdUser));
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const userId = user._id.toString();

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -avatarPublicId"
  );

  const accessTokenCookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  const refreshTokenCookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenCookiesOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookiesOptions)
    .json(
      new ApiResponse(200, "Login successful", {
        user: loggedInUser,
      })
    );
});

const logOut = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, "User not found");

  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
  });

  res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

const checkSession = asyncHandler(async (req: Request, res: Response) => {
  const incomingAccessToken =
    req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;

  if (!incomingAccessToken) {
    throw new ApiError(401, "Unauthorized - No token provided");
  }

  const decoded = jwt.verify(
    incomingAccessToken,
    process.env.ACCESS_TOKEN_SECRET!
  ) as JwtPayload;

  if (!decoded?.userId) {
    throw new ApiError(401, "Invalid token - Missing user identifier");
  }

  const user = await User.findById(decoded.userId).select(
    "-password -refreshToken -avatarPublicId"
  );

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  res.status(200).json(new ApiResponse(200, "Session valid", { user: user }));
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized - No refresh token provided");
  }

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET!
  ) as JwtPayload;

  const user = await User.findById(decoded.userId);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const newAccessToken = generateAccessToken(user._id.toString());

  const returnUser = await User.findById(decoded.userId).select(
    "-password -refreshToken -avatarPublicId"
  );

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
  });

  const accessTokenCookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  res
    .status(200)
    .cookie("accessToken", newAccessToken, accessTokenCookiesOptions)
    .json(
      new ApiResponse(200, "Tokens refreshed successfully", {
        accessToken: newAccessToken,
        user: returnUser,
      })
    );
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const { username, email } = req.body;
  const avatarFile = req.file;

  if (!username && !email && !avatarFile) {
    throw new ApiError(400, "No fields to update");
  }

  if (username && (username.length < 6 || username.length > 20)) {
    throw new ApiError(400, "Username must be between 6 and 20 characters");
  }

  if (email && !testEmail(email)) {
    throw new ApiError(400, "Invalid email");
  }

  if (username) {
    const existingUsername = await User.findOne({
      username,
      _id: { $ne: userId },
    });
    if (existingUsername) {
      throw new ApiError(409, "Username already taken");
    }
    user.username = username;
  }

  if (email) {
    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) {
      throw new ApiError(409, "Email already in use");
    }
    user.email = email;
  }

  if (avatarFile) {
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }
    const cloudinaryResponse = await uploadOnCloudinary(avatarFile.path);
    if (!cloudinaryResponse) {
      throw new ApiError(500, "Avatar upload failed");
    }
    user.avatar = cloudinaryResponse.secure_url;
    user.avatarPublicId = cloudinaryResponse.public_id;
  }

  await user.save({ validateModifiedOnly: true });
  const updatedUser = await User.findById(userId).select(
    "-password -refreshToken -avatarPublicId"
  );

  res.status(200).json(new ApiResponse(200, "Profile updated", updatedUser));
});

const getAllActiveUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.countDocuments();
  res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", users));
});

export {
  signup,
  login,
  checkSession,
  updateProfile,
  refreshAccessToken,
  logOut,
  getAllActiveUsers,
};
