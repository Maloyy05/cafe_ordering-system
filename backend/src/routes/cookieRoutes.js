const express = require('express');
const multer = require('multer');
const upload = multer();
const { getCookies, createCookieProduct, updateCookieProduct, deleteCookieProduct, uploadCookieProductImage } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validation');
const router = express.Router();

// Public: list cookies
router.get('/', getCookies);
// Admin & Staff can manage cookie products
router.post('/', authMiddleware, roleMiddleware(['admin','staff']), validate('createProduct'), createCookieProduct);
router.post('/upload', authMiddleware, roleMiddleware(['admin','staff']), upload.single('image'), uploadCookieProductImage);
router.put('/:id', authMiddleware, roleMiddleware(['admin','staff']), validate('updateProduct'), updateCookieProduct);
router.delete('/:id', authMiddleware, roleMiddleware(['admin','staff']), deleteCookieProduct);

module.exports = router;
