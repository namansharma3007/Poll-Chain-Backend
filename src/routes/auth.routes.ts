import { Router } from "express";
import { signup, login, checkSession, updateProfile , refreshAccessToken, logOut, getAllActiveUsers } from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { handleAvatarUpload } from "../middleware/multer.middleware";

const authRoute: Router = Router();

authRoute.post("/login", login);
authRoute.post("/signup", handleAvatarUpload, signup);
authRoute.post("/logout", authMiddleware, logOut);

authRoute.get("/check-session", checkSession);
authRoute.post("/refresh-token", refreshAccessToken);

authRoute.patch("/update-profile", authMiddleware, handleAvatarUpload, updateProfile );

authRoute.get("/get-active-users", authMiddleware, getAllActiveUsers);

export { authRoute };