import mongoose, { Schema, Document, Types  } from "mongoose";

interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string; 
  avatar?: string;
  avatarPublicId?: string;
  refreshToken?: string;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarPublicId: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model<IUser>("User", UserSchema);

export { User, IUser };
