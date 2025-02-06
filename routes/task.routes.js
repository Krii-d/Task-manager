const express = require("express");
const router = express.Router();

const {
  createTask,
  getTaskById,
  getAllTasks,
  deleteTaskById,
  deleteAllTasks,
  updateTask,
} = require("../controller/task.controller");

const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/api/tasks", authMiddleware, createTask);
router.get("/api/tasks", getAllTasks);
router.get("/api/tasks/:id", authMiddleware, getTaskById);
router.delete("/api/tasks/:id", authMiddleware, deleteTaskById);
router.delete("/api/tasks", authMiddleware, deleteAllTasks);
router.patch("/api/tasks/:id", authMiddleware, updateTask);

module.exports = router;
