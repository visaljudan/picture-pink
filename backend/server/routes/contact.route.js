import express from "express";
import {
  createContacts,
  deleteContact,
  getAllContacts,
} from "../controllers/contact.controller.js";
import { auth } from "../utils/verify.js";

const contactRouter = express.Router();

contactRouter.get("/", getAllContacts);
contactRouter.post("/", createContacts);
contactRouter.delete("/:id", auth, deleteContact);

export default contactRouter;
