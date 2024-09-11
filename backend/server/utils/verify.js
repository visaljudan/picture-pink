import jwt from "jsonwebtoken";
import { sendError } from "./response.js";
import { roleAdmin } from "../source.js";
import User from "../models/user.model.js";

export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Unauthorized, no token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return sendError(res, 404, "User not found!");
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, "Unauthorized, invalid token", error);
  }
};

export const admin = (req, res, next) => {
  if (req.user.role !== roleAdmin) {
    return sendError(res, 403, "Access denied. Insufficient permissions.");
  }
  next();
};
