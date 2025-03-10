import multer, { MulterError } from "multer";
import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import { ApiError } from "../utils/ApiError";

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const dir = "./uploads/avatars";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const handleAvatarUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("avatar")(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          next(new ApiError(413, "File size exceeds 5MB limit"));
        } else {
          next(new ApiError(400, "File upload failed"));
        }
      } else {
        next(err);
      }
    } else {
      next();
    }
  });
};

export { handleAvatarUpload };
