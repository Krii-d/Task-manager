const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

const userRouter = require("./routes/user.routes");
const taskRouter = require("./routes/task.routes");
const categoryRouter = require("./routes/category.routes");
const path = require("path");

// Middleware to parse JSON
app.use(express.json());

// Middleware for file uploads
app.use(fileUpload());

// Serve static files
app.use("/files", express.static(path.join(__dirname, "/storage")));

// Routes
app.use(userRouter);
app.use(taskRouter);
app.use(categoryRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
