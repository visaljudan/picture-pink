import express from "express";
import { auth } from "../utils/verify.js";
import {
  changeSave,
  getAllSavesByUserID,
} from "../controllers/save.controller.js";

const saveRouter = express.Router();

saveRouter.post("/", auth, changeSave);
saveRouter.get("/user/:user_id", auth, getAllSavesByUserID);

export default saveRouter;
