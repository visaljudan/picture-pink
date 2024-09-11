import express from "express";
import { signin, signup } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
// authRouter.post("/signout", signout);

export default authRouter;
