// auth.middleware.ts
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";

const secret = process.env.ACCESS_TOKEN_SECRET as string;


const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;
  
  if (!token) {
    throw new ApiError(401, "Unauthorized - No token provided");
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    if (!decoded?.userId) {
      throw new ApiError(401, "Invalid token - Missing user identifier");
    }

    const user = await User.findById(decoded.userId).select("-password -refreshToken -avatarPublicId");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    }
    throw new ApiError(401, "Unauthorized access");
  }
});

export { authMiddleware };