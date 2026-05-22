const express = require('express');
const multer = require('multer');
const upload = multer();
const { getTeas, createTeaProduct, updateTeaProduct, deleteTeaProduct, uploadTeaProductImage } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validation');
const router = express.Router();

// Public: list teas
router.get('/', getTeas);
// Admin & Staff can manage tea products
router.post('/', authMiddleware, roleMiddleware(['admin','staff']), validate('createProduct'), createTeaProduct);
router.post('/upload', authMiddleware, roleMiddleware(['admin','staff']), upload.single('image'), uploadTeaProductImage);
router.put('/:id', authMiddleware, roleMiddleware(['admin','staff']), validate('updateProduct'), updateTeaProduct);
router.delete('/:id', authMiddleware, roleMiddleware(['admin','staff']), deleteTeaProduct);

module.exports = router;
