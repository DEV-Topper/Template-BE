import express from "express";
import { isAuthenticated, isAdmin } from "../middlewares/auth";
import { uploadAvatar } from "../middlewares/upload";
import { validateUser, validateAdmin } from "../middlewares/validation";
import {
  createUser,
  forgotPassword,
  getAllUsers,
  makeAdmin,
  resetPassword,
  signInUser,
  signOutUser,
  updateUser,
  verifyUser,
} from "../controllers/userController";

const router = express.Router();

// User Routes
router.post("/register", validateUser, createUser);
router.post("/login", signInUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify/:userID", verifyUser);
router.post("/update-profile", isAuthenticated, uploadAvatar, updateUser);
router.post("/signout", isAuthenticated, signOutUser);

// Admin Routes
router.post("/register-admin", validateAdmin, createUser);
router.post("/make-admin/:userID", isAuthenticated, isAdmin, makeAdmin);
router.get("/users", isAuthenticated, isAdmin, getAllUsers);

export default router;
