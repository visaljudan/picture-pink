import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitUserEvent } from "../utils/socketioFunctions.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return sendError(res, 404, "No records found!");
    }
    sendSuccess(res, 200, "Users found", users);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return sendError(res, 404, "User ID is invalid");
  }
  try {
    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    sendSuccess(res, 200, "Users found", user);
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, profile_image, password } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return sendError(res, 404, "User ID is invalid");
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (email) {
      const existingEmail = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
        _id: { $ne: id },
      });

      if (existingEmail) {
        return sendError(res, 409, "Email already exists");
      }
      user.email = email;
    }

    if (profile_image !== undefined) {
      user.profile_image = profile_image;
    }

    if (password !== undefined) {
      if (password.length === 0) {
        user.password = user.password;
      } else if (password.length < 6) {
        return sendError(
          res,
          422,
          "Password should be at least 6 characters long."
        );
      } else {
        user.password = await bcryptjs.hash(password, 10);
      }
    }

    await user.save();

    emitUserEvent("userUpdated", user);

    sendSuccess(res, 200, "User updated successfully", user);
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return sendError(res, 404, "User not found");
  }

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }
    emitUserEvent("userDeleted", id);
    sendSuccess(res, 200, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};
