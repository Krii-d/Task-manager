const express = require("express");
const {
  register,
  login,
  uploadAvatar,
  deleteAvatar,
  checkOtp,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("./../controller/user.controller");

const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/api/register", register);
router.post("/api/login", login);
router.post("/api/check-otp", checkOtp);
router.post("/api/avatar", authMiddleware, uploadAvatar);
router.delete("/api/avatar", authMiddleware, deleteAvatar);
router.post("/api/forgot-password", forgotPassword);
router.post("/api/reset-password", resetPassword);
router.post("/api/change-password", authMiddleware, changePassword);

module.exports = router;
