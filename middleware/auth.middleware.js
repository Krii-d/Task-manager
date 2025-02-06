const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Checking if token exists in header or not
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: "token not found" });
  }
  // extract jwt token from the  user header
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);

    // attach user info to payload
    req.user = decoded;
    console.log(req.user);

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Function to generate token
const generateToken = (userData) => {
  // Generate new jwt token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 3000 });
};

// Function to generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

module.exports = { authMiddleware, generateToken, generateOTP };
