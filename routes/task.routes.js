const express = require("express");
const router = express.Router();

const {createTask} = require("../controller/task.controller");

router.post('/api/tasks', createTask);

module.exports = router;