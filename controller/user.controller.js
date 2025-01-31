const bcrypt = require("bcryptjs");
const prisma = require("../prisma/prisma.client");
const jwt = require("jsonwebtoken");
const {generateToken} = require("../middleware/auth.middleware")

const register = async (req, res) => {
    try {
      const { name, username, password, email, phone_no } = req.body;
  
      // Validate input
      if (!name || !username || !password || !email) {
        return res.status(400).json({ error: "All fields except phone_no are required." });
      }
  
      // Check if the username or email already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });
  
      if (existingUser) {
        return res.status(400).json({ error: "Username or email already exists." });
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

     const payLoad = {
      id:newUser.id,
      username:newUser.username,
      email:newUser.email
     }

      // Generate a JWT token for the user
const token = generateToken(payLoad);

  
      res.status(201).json({
      messgae: "user created successfully",
      token
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong." });
    }
  };


  
  const login = async(req, res) => {
    try{
      const {usernameOrEmail , password} = req.body;

      // Validate input
      if(!usernameOrEmail||!password) {
        return res.status(400).json({ error: "Username or Email and password are required." });
      }


      //checks if the email , username  exists in the database
      const user = await prisma.user.findFirst({
        where:{
          OR: [
            { email: usernameOrEmail },
             { username : usernameOrEmail}
            
          ]
        }
      });

      if(!user){
        return res.status(401).json({ error: "Invalid credentials" });
      }

      //Compare the provided password with hashed password in the database
      isPasswordValid = await bcrypt.compare ( password , user.password) ;
      
      if(!isPasswordValid){
        return res.status(401).json({ error: "Invalid password" });
      }

      // create a payload for the JWT token
      const payload = {
        id:user.id,
        username:user.username,
        email:user.email
       }

       // Generate a JWT token for the user
 token = generateToken(payload);

 res.status(201).json({
  messgae: "login successfully",
  token
  });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Something went wrong." });
}

    
  };

module.exports = {register , login};