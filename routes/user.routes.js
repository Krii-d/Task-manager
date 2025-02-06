const express = require("express");
const {
  register,
  login,
  uploadAvatar,
  deleteAvatar,
} = require("./../controller/user.controller");

const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/api/register", register);
router.post("/api/login", login);
router.post("/api/avatar", authMiddleware, uploadAvatar);
router.delete("/api/avatar", authMiddleware, deleteAvatar);

module.exports = router;
