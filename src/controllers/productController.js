const Product = require('../models/productModel');

const productController = {
  // GET: ดึงข้อมูลสินค้าทั้งหมด
  getProducts: async (req, res) => {
    try {
      const products = await Product.getAll();
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // POST: เพิ่มสินค้าใหม่
  createProduct: async (req, res) => {
    try {
      const { name, price, unit } = req.body;
      
      // ตรวจสอบข้อมูลบังคับพื้นฐาน
      if (!name || !price || !unit) {
        return res.status(400).json({ 
          success: false, 
          message: 'กรุณากรอกข้อมูลชื่อสินค้า, ราคา และหน่วยนับให้ครบถ้วน' 
        });
      }

      const newProduct = await Product.create(req.body);
      res.status(201).json({
        success: true,
        message: 'เพิ่มสินค้าสำเร็จ',
        data: newProduct
      });
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.code === '23505') { // โค้ดของ PostgreSQL กรณี Barcode ซ้ำ (Unique constraint)
        return res.status(400).json({ success: false, message: 'Barcode นี้มีอยู่ในระบบแล้ว' });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // PUT: แก้ไขข้อมูลสินค้า
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, unit } = req.body;

      if (!name || !price || !unit) {
        return res.status(400).json({ 
          success: false, 
          message: 'กรุณากรอกข้อมูลชื่อสินค้า, ราคา และหน่วยนับให้ครบถ้วน' 
        });
      }

      const updatedProduct = await Product.update(id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: 'ไม่พบสินค้าที่ต้องการแก้ไข' });
      }

      res.status(200).json({
        success: true,
        message: 'แก้ไขสินค้าสำเร็จ',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'Barcode นี้มีอยู่ในระบบแล้ว' });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // DELETE: ลบสินค้า
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Product.remove(id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'ไม่พบสินค้าที่ต้องการลบ' });
      }

      res.status(200).json({
        success: true,
        message: 'ลบสินค้าสำเร็จ'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = productController;