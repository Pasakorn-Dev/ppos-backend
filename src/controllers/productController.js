const productModel = require('../models/productModel');

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const products = await productModel.getAllProducts();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
    }
  },

  createProduct: async (req, res) => {
    try {
      const newProduct = await productModel.createProduct(req.body);
      res.status(201).json({ success: true, message: 'เพิ่มสินค้าเรียบร้อยแล้ว', data: newProduct });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await productModel.updateProduct(id, req.body);
      res.status(200).json({ success: true, message: 'อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว', data: updated });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขสินค้า' });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      await productModel.deleteProduct(id);
      res.status(200).json({ success: true, message: 'ลบรายการสินค้าเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบสินค้า' });
    }
  },

  getProductBranchPrices: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const accessLevel = Number(user.access_level || 3); // ดึงจาก permissionMiddleware (ตามเมนู)

      const prices = await productModel.getBranchPricesByProduct(id, user);
      res.status(200).json({ success: true, data: prices });
    } catch (error) {
      console.error('Error fetching branch prices:', error);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงราคาสาขา' });
    }
  },

  saveProductBranchPrices: async (req, res) => {
    try {
      const { id } = req.params;
      const { prices } = req.body;
      const user = req.user;
      const userId = user.id;
      const accessLevel = Number(user.access_level || 3); // ดึงจาก permissionMiddleware (ตามเมนู)
      const userBranchId = user.branch_id;

      if (!Array.isArray(prices)) {
        return res.status(400).json({ success: false, message: 'รูปแบบข้อมูลราคาสาขาไม่ถูกต้อง' });
      }

      // Debug log
      console.log('=== saveProductBranchPrices Debug ===');
      console.log('Product ID:', id);
      console.log('Access Level from permission middleware:', accessLevel);
      console.log('User Branch ID:', userBranchId);
      console.log('Saving prices for branches:', prices.map(p => p.branch_id));

      // ตรวจสอบสิทธิ์ access_level สำหรับการบันทึกราคาสาขา
      if (accessLevel === 3) {
        // Level 3: Staff - อนุญาตให้แก้ไขเฉพาะสาขาของตัวเองเท่านั้น
        for (const price of prices) {
          if (Number(price.branch_id) !== userBranchId) {
            return res.status(403).json({ 
              success: false, 
              message: 'ปฏิเสธการเข้าถึง: คุณสามารถแก้ไขราคาเฉพาะสาขาของตัวเองได้เท่านั้น' 
            });
          }
        }
      } else if (accessLevel === 2) {
        // Level 2: Manager - ตรวจสอบว่ามีสิทธิ์เข้าถึงสาขาเหล่านั้นหรือไม่
        const db = require('../config/db');
        for (const price of prices) {
          const checkRes = await db.query(
            'SELECT * FROM user_branches WHERE user_id = $1 AND branch_id = $2',
            [userId, price.branch_id]
          );
          if (checkRes.rows.length === 0) {
            return res.status(403).json({ 
              success: false, 
              message: `ปฏิเสธการเข้าถึง: คุณไม่มีสิทธิ์แก้ไขราคาสาขา ${price.branch_id}` 
            });
          }
        }
      }
      // Level 1: Admin - อนุญาตให้แก้ไขทั้งหมด

      await productModel.saveBranchPrices(id, prices);
      res.status(200).json({ success: true, message: 'บันทึกราคาสาขาเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error saving branch prices:', error);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกราคาสาขา' });
    }
  }
};

module.exports = productController;