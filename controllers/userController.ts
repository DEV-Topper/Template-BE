import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import { sendEmail } from "../utils/email";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { roles } from "../utils/enums";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      middleName,
      address,
      maritalStatus,
      phone,
    } = req.body;
    const verifyCode: string = crypto.randomBytes(3).toString("hex");
    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      firstName,
      lastName,
      middleName,
      email,
      phone,
      address,
      maritalStatus,
      password: hashedPassword,
      role: role ? role : roles.USER,
      verifyCode,
    });

    await sendEmail(user.email, "Account Verification", "index", {
      email: user.email,
      verifyCode,
      id: user._id,
    });

    return res.status(201).json({
      message:
        "User created successfully. Please check your email to verify your account.",
      data: user,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

export const signInUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ error: "User with this email does not exist" });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "20m",
    });
    const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await sendEmail(email, "Password Reset", "forgotPassword", {
      link,
      name: `${user.firstName} ${user.lastName}`,
    });

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await userModel.findById(decoded._id);
    if (!user)
      return res
        .status(400)
        .json({ error: "User with this token does not exist" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await userModel.findById(userID);

    if (!user) return res.status(400).json({ error: "User not found" });

    user.verify = true;
    user.verifyCode = "";
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

export const updateUser = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "avatars" },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) {
            return res
              .status(500)
              .json({ error: "Upload failed", details: error.message });
          }

          updates.avatar = result?.secure_url!;

          userModel
            .findByIdAndUpdate(userId, updates, { new: true })
            .then((user) => {
              if (!user)
                return res.status(404).json({ error: "User not found" });
              res
                .status(200)
                .json({ message: "Profile updated successfully", data: user });
            })
            .catch((err) => res.status(500).json({ error: err.message }));
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      const user = await userModel.findByIdAndUpdate(userId, updates, {
        new: true,
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      res
        .status(200)
        .json({ message: "Profile updated successfully", data: user });
    }
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

export const signOutUser = (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "User signed out successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

export const makeAdmin = async (req: any, res: Response) => {
  try {
    const { userID } = req.params;
    const user = await userModel.findById(userID);

    if (!user) return res.status(400).json({ error: "User not found" });

    user.role = roles.ADMIN;
    await user.save();

    res.status(200).json({ message: "User role updated to admin", data: user });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.find();
    res.status(200).json({ data: users });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};
