import { IUser } from "../models/user.model";
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}