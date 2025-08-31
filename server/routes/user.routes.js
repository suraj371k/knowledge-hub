import express from "express";
import {
  fetchProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.get("/profile", authenticate, fetchProfile);

export default router;
