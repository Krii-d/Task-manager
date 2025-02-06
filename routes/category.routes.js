const express = require("express");
const router = express.Router();

const {createCategory,
getAllCategories,
getCategoryById,
updateCategory ,
deleteCategory
 } = require('../controller/category.controller.js')

const {authMiddleware} = require("../middleware/auth.middleware");

router.post('/api/categories', authMiddleware, createCategory);
router.get('/api/categories', authMiddleware, getAllCategories);
router.get('/api/categories/:id', authMiddleware,getCategoryById);
router.patch('/api/categories/:id', authMiddleware,updateCategory); 
router.delete('/api/categories/:id', authMiddleware,deleteCategory);

module.exports = router;
