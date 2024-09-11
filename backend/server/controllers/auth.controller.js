import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendError, sendSuccess } from "../utils/response.js";
import { isValidEmail } from "../utils/validation.js";
import { emitUserEvent } from "../utils/socketioFunctions.js";

export const signup = async (req, res, next) => {
  const { name, email, profile_image, password } = req.body;

  try {
    if (!process.env.JWT_SECRET) {
      return sendError(res, 500, "JWT secret not configured");
    }

    if (!isValidEmail(email)) {
      next(sendError(res, 422, "Invalid email address."));
    }

    if (password.length < 6) {
      return sendError(
        res,
        422,
        "Password should be at least 6 characters long."
      );
    }

    const existingEmail = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (existingEmail) {
      return sendError(res, 409, "Email is already in use.");
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      name,
      email,
      profile_image,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    const tokenUser = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    savedUser.token = tokenUser;
    await savedUser.save();

    emitUserEvent("userCreated", savedUser);
    sendSuccess(res, 200, "User registered successfully", savedUser);
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!process.env.JWT_SECRET) {
      return next(sendError(res, 500, "JWT secret not configured"));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return sendError(res, 400, "User with this Email does not exist.");
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return sendError(res, 401, "Incorrect password.");
    }

    const tokenUser = jwt.sign(
      { id: existingUser._id },
      process.env.JWT_SECRET
    );

    existingUser.token = tokenUser;
    await existingUser.save();

    sendSuccess(res, 200, "User signed in successfully", existingUser);
  } catch (error) {
    next(error);
  }
};
