import mongoose from "mongoose";
import { roleAdmin, roleUser } from "../source.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: [roleUser, roleAdmin],
      default: roleUser,
    },
    profile_image: {
      type: String,
      default:
        "https://images.vexels.com/content/147101/preview/instagram-profile-button-68a534.png",
    },
    password: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
