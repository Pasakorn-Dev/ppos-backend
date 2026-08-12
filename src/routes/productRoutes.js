const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// เส้นทางสำหรับสินค้า
router.get('/', productController.getProducts);       // GET /api/products
router.post('/', productController.createProduct);   // POST /api/products
router.put('/:id', productController.updateProduct);     // แก้ไขสินค้าตาม ID
router.delete('/:id', productController.deleteProduct);  // ลบสินค้าตาม ID

module.exports = router;