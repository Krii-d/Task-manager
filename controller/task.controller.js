const prisma = require("../prisma/prisma.client");

const createTask = async (req, res) => {
  try {
    const { title, description, due_date, priority, category_id } = req.body;
    const user_id = req.user.id; // Get user ID from auth middleware

    //validate
    if (!title || !description || !due_date || !priority || !category_id) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    //create task
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        due_date,
        priority,
        user_id,
        category_id,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

//get all tasks

const getAllTasks = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    skip = (page - 1) * limit;
    const tasks = await prisma.task.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: { username: true, email: true, phone_no: true },
        },
      },
    });

    const totalTasks = await prisma.task.count();

    res.status(200).json({
      status: "success",
      page,
      limit,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      data: tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

//get task by id

const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await prisma.task.findUnique({
      where: {
        id: taskId, // Use taskId directly if it's a UUID (string)
      },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        }, // Include user details
        category: true, // Include category if it exists
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

//delete task by id
const deleteTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find the task before deleting
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId },
    });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

//delete all tasks
const deleteAllTasks = async (req, res) => {
  try {
    // Delete all tasks from the database
    await prisma.task.deleteMany({});

    res.status(200).json({ message: "All tasks deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Update task by ID

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, due_date, priority, status } = req.body;

    // Validate input
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    // Check if the task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        due_date: due_date ? new Date(due_date) : undefined, // Convert date
        priority,
        status,
      },
    });

    res.status(200).json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  deleteTaskById,
  deleteAllTasks,
  updateTask,
};
