const prisma = require("../prisma/prisma.client");

//createCategory
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const user_id = req.user.id;

    //validate category
    if (!name) {
      return res.status(400).json({
        message: "Name is required.",
      });
    }

    //create category
    const newCategory = await prisma.category.create({
      data: {
        name,
        user_id,
      },
    });
    res.status(201).json({
      status: "Success ",
      data: newCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

//get all categories
const getAllCategories = async (req, res) => {
  try {
    //get query parameters for pagination
    let { page, limit } = req.query;

    //convert string to number
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    //calculate the starting index
    const skip = (page - 1) * limit;

    // Fetch paginated categories
    const categories = await prisma.category.findMany({
      skip,
      take: limit,
    });

    // Get total count of categories
    const totalCategories = await prisma.category.count();

    res.status(200).json({
      status: "success",
      page,
      limit,
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

//get category by id
const getCategoryById = async (req, res) => {
  try {
    const category_id = req.params.id;
    const category = await prisma.category.findUnique({
      where: { id: category_id },
    });
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

//update category by id

const updateCategory = async (req, res) => {
  try {
    const category_id = req.params.id;
    const { name } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: category_id },
      data: { name },
    });

    res
      .status(200)
      .json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

//delete a category

const deleteCategory = async (req, res) => {
  try {
    const category_id = req.params.id;

    const category = await prisma.category.findUnique({
      where: { id: category_id },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete category
    await prisma.category.delete({
      where: { id: category_id },
    });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
