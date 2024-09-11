import mongoose from "mongoose";
import { sendError, sendSuccess } from "../utils/response.js";
import User from "../models/user.model.js";
import Save from "../models/save.model.js";
import Post from "../models/post.model.js";
import { emitSaveEvent } from "../utils/socketioFunctions.js";

export const getAllSavesByUserID = async (req, res, next) => {
  const { user_id } = req.params;

  try {
    if (!mongoose.isValidObjectId(user_id)) {
      return sendError(res, 400, "User ID is invalid");
    }

    const user = await User.findById(user_id);

    if (!user) {
      return sendError(res, 404, "User not found!");
    }

    const saves = await Save.find({ user_id: user._id })
      .populate("user_id")
      .populate("post_id");

    if (!saves || saves.length === 0) {
      return sendError(res, 200, "No records found!");
    }

    sendSuccess(res, 200, "Saves found", saves);
  } catch (error) {
    next(error);
  }
};

export const changeSave = async (req, res, next) => {
  const { user_id, post_id, save_id } = req.body;
  try {
    if (!user_id) {
      return sendError(res, 400, "User ID is required");
    }

    if (!mongoose.isValidObjectId(user_id)) {
      return sendError(res, 400, "User ID is invalid");
    }

    const user = await User.findById(user_id);
    if (!user) {
      return sendError(res, 404, "User not found!");
    }

    if (!post_id) {
      return sendError(res, 400, "Post ID is required");
    }

    if (!mongoose.isValidObjectId(post_id)) {
      return sendError(res, 400, "Post ID is invalid");
    }

    const post = await Post.findById(post_id);
    if (!post) {
      return sendError(res, 404, "Post not found!");
    }

    const save = await Save.findOneAndDelete({
      user_id: user._id,
      post_id: post_id,
    });

    if (save) {
      emitSaveEvent("saveDeleted", save);
      return sendSuccess(res, 200, "Save deleted successfully", save);
    }

    const newSave = new Save({
      user_id,
      post_id,
    });

    const savedSave = await newSave.save();
    emitSaveEvent("saveCreated", savedSave);
    return sendSuccess(res, 201, "Save created successfully", savedSave);
  } catch (error) {
    next(error);
  }
};
