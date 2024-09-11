import express from "express";
import {
  deleteUserById,
  getAllUsers,
  getUser,
  updateUserById,
} from "../controllers/user.controller.js";
import { admin, auth } from "../utils/verify.js";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUser);
userRouter.put("/:id", auth, updateUserById);
userRouter.delete("/:id", auth, admin, deleteUserById);

export default userRouter;
