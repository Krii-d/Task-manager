const prisma = require("../prisma/prisma.client");

const createTask = async(req,res) => {
try{
    const {title , description , due_date , priority} = req.body ; 
    const user_id = req.user.id; // Get user ID from auth middleware

    //validate 
    if(!title|| !description || !due_date || !priority ) {
        return res.status(400) .json({
            message : 'All fields are required'
        })
    }

    //create task
    const newTask = await prisma.task.create({
        data: {
            title,
            description,
            due_date,
            priority,
            user_id

        }
    })

    res.status(201) . json(newTask);
 }
 catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = {createTask};