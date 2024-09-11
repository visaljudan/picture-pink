import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getAllPostsByUserID,
  updatePost,
} from "../controllers/posts.controller.js";
import { auth } from "../utils/verify.js";

const postRouter = express.Router();

postRouter.get("/", getAllPosts);
postRouter.post("/", auth, createPost);
postRouter.put("/:id", auth, updatePost);
postRouter.delete("/:id", auth, deletePost);
postRouter.get("/user/:user_id", auth, getAllPostsByUserID);

export default postRouter;
