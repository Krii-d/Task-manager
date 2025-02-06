const bcrypt = require("bcryptjs");
const prisma = require("../prisma/prisma.client");

const fs = require("fs/promises");
const path = require("path");

const { generateToken, generateOTP } = require("../middleware/auth.middleware");
const { genericUploadFiles } = require("../utils/imageUpload");
const { sendEmail } = require("../utils/sendMail");

const register = async (req, res) => {
  try {
    const { name, username, password, email, phone_no } = req.body;

    // Validate input
    if (!name || !username || !password || !email) {
      return res
        .status(400)
        .json({ error: "All fields except phone_no are required." });
    }

    // Check if the username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        email,
        phone_no,
      },
    });

    console.log(newUser);

    const expectedOTP = generateOTP().toString();
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    const formattedExpiryDate = currentDate.toISOString();

    const otp = await prisma.oTP.create({
      data: {
        user_id: newUser.id,
        code: expectedOTP,
        expiresAt: formattedExpiryDate,
      },
    });
    console.log("otp", otp);
    console.log("user email", newUser.email);

    await sendEmail({
      to: newUser.email,
      subject: "Your OTP for Login",
      text: `Your OTP for login is ${expectedOTP}`,
    });
    console.log(`Your OTP for login is ${expectedOTP}`);
    res.status(200).json({
      data: {
        user: newUser,
      },
      message: "OTP sent to your email address. Please check your inbox.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
};

const checkOtp = async (req, res) => {
  const { otp, id } = req.body;
  try {
    const userOtp = await prisma.oTP.findFirst({
      where: {
        user_id: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!userOtp) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log("user:", userOtp);
    if (parseInt(otp) !== parseInt(userOtp.code)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
    await prisma.user.update({
      where: {
        id: userOtp.user_id,
      },
      data: {
        isVerified: true,
      },
    });
    res.status(200).json({
      message: "OTP verified",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error"); // Respond with an error status
  }
};

const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Validate input
    if (!usernameOrEmail || !password) {
      return res
        .status(400)
        .json({ error: "Username or Email and password are required." });
    }

    //checks if the email , username  exists in the database
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    //Compare the provided password with hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    if (!user.isVerified) {
      delete user.password;

      return res.status(403).json({
        message: "Account is not verified",
        data: { user: user },
      });
    }

    // create a payload for the JWT token
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    // Generate a JWT token for the user
    token = generateToken(payload);

    res.status(201).json({
      messgae: "login successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    // Extract user ID from token (assuming `req.user` is populated from middleware)
    const userId = req.user.id;

    //extract avatar from form data
    const file = req.files.avatar;
    console.log("files:", file);

    // Check if a file is uploaded
    if (!req.files || !file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Upload the file to the "avatars" folder
    const filePath = await genericUploadFiles(file, "avatars");

    // Check if the upload was successful
    if (!filePath) {
      return res.status(500).json({ error: "File upload failed." });
    }

    // Update the user's avatar column in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: `${filePath}` },
    });

    res.status(200).json({
      message: "Avatar uploaded successfully!",
      filePath: updatedUser.avatar, // Return the new avatar path
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    // 1. Extract user ID from the request (populated by authMiddleware)
    const userId = req.user.id;

    // 2. Retrieve the user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 3. Check if the user has an avatar to delete
    if (!user.avatar) {
      return res.status(400).json({ error: "No avatar to delete." });
    }

    // 4. Construct the absolute path to the avatar file
    // Assuming user.avatar contains a relative path like "avatars/filename.jpg"
    const filePath = path.join(__dirname, "../storage", user.avatar);

    // 5. Delete the file. If the file does not exist, log the error and continue.
    try {
      await fs.unlink(filePath);
      console.log(`Deleted avatar file: ${filePath}`);
    } catch (fileError) {
      console.error(
        "Error deleting the file. It might have been already removed.",
        fileError
      );

      return res.status(500).json({ error: "Failed to delete avatar file." });
      // Optionally, you can decide to return an error here or proceed with updating the user record.
    }

    // 6. Update the user record to remove the avatar path
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    });

    // 7. Return a success response
    res.status(200).json({
      message: "Avatar deleted successfully.",
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { register, login, uploadAvatar, deleteAvatar, checkOtp };
