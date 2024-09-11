import nodemailer from "nodemailer";
import { sendError, sendSuccess } from "../utils/response.js";
import Contact from "../models/contact.model.js";
import { emitContactEvent } from "../utils/socketioFunctions.js";
import mongoose from "mongoose";

export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();

    if (!contacts || contacts.length === 0) {
      return sendError(res, 404, "No records found!");
    }
    sendSuccess(res, 200, "posts found", contacts);
  } catch (error) {
    next(error);
  }
};

export const createContacts = async (req, res, next) => {
  const { name, email, subject, message } = req.body;
  try {
    if (!name) {
      return sendError(res, 400, "Name is required");
    }
    if (!email) {
      return sendError(res, 400, "Email is required");
    }
    if (!subject) {
      return sendError(res, 400, "Subject is required");
    }
    if (!message) {
      return sendError(res, 400, "Message is required");
    }

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });

    const savedContact = await newContact.save();
    emitContactEvent("contactCreated", savedContact);

    sendSuccess(res, 201, "Contact send successfully", savedContact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return sendError(res, 404, "Contact is invalid");
  }

  try {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return sendError(res, 404, "Contact not found");
    }
    emitContactEvent("contactDeleted", id);
    sendSuccess(res, 200, "Contact deleted successfully");
  } catch (error) {
    next(error);
  }
};
