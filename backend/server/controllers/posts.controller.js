import mongoose from "mongoose";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitPostEvent } from "../utils/socketioFunctions.js";

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("user_id");

    if (!posts || posts.length === 0) {
      return sendError(res, 404, "No records found!");
    }
    sendSuccess(res, 200, "posts found", posts);
  } catch (error) {
    next(error);
  }
};

export const getAllPostsByUserID = async (req, res, next) => {
  const { user_id } = req.params;

  try {
    if (!mongoose.isValidObjectId(user_id)) {
      return sendError(res, 400, "User ID is invalid");
    }

    const user = await User.findById(user_id);

    if (!user) {
      return sendError(res, 404, "User not found!");
    }

    const posts = await Post.find({ user_id: user._id }).populate("user_id");

    if (!posts || posts.length === 0) {
      return sendError(res, 404, "No records found!");
    }

    sendSuccess(res, 200, "Posts found", posts);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  const { user_id, title, description, status, image, approve } = req.body;
  try {
    if (!user_id) {
      return sendError(res, 400, "User ID is required");
    }

    if (!mongoose.isValidObjectId(user_id)) {
      return sendError(res, 400, "User ID is invalid");
    }

    if (!title) {
      return sendError(res, 400, "Title is required.");
    }

    if (!description) {
      return sendError(res, 400, "Descriptionis required.");
    }

    if (!image) {
      return sendError(res, 400, "Image is required.");
    }

    const user = await User.findById(user_id);

    if (!user) {
      return sendError(res, 404, "User not found!");
    }

    const newPost = new Post({
      user_id,
      title,
      description,
      status,
      approve,
      image,
    });

    const savedPost = await newPost.save();
    emitPostEvent("postCreated", savedPost);

    sendSuccess(res, 201, "Post created successfully", savedPost);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, image, status, approve } = req.body;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Post ID is invalid");
    }

    const post = await Post.findById(id).populate("user_id");

    if (!post) {
      return sendError(res, 404, "Post not found!");
    }

    if (title !== undefined) {
      post.title = title;
    } else {
      post.title = post.title;
    }

    if (description !== undefined) {
      post.description = description;
    } else {
      post.description = post.description;
    }

    if (image !== undefined) {
      post.image = image;
    } else {
      post.image = post.image;
    }

    if (status !== undefined) {
      post.status = status;
    } else {
      post.status = post.status;
    }

    if (approve !== undefined) {
      post.approve = approve;
    } else {
      post.approve = post.approve;
    }

    await post.save();

    emitPostEvent("postUpdated", post);

    console.log(post);

    sendSuccess(res, 200, "Post updated successfully", post);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return sendError(res, 404, "Post is invalid");
  }

  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return sendError(res, 404, "Post not found");
    }
    emitPostEvent("postDeleted", id);
    sendSuccess(res, 200, "Post deleted successfully");
  } catch (error) {
    next(error);
  }
};
