const pool = require('../config/db'); // เรียกใช้งาน Pool เชื่อมต่อ Database ของคุณ

const Product = {
  // ดึงรายการสินค้าทั้งหมด (พร้อม Join ดึงชื่อ หมวดหมู่, ผู้จำหน่าย, และหน่วยนับ)
  getAll: async () => {
    const query = `
      SELECT 
        p.*, 
        c.name AS category_name, 
        s.name AS supplier_name, 
        u.unit_name AS unit_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN units u ON p.unit_id = u.id
      ORDER BY p.id DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  // เพิ่มสินค้าใหม่
  create: async (productData) => {
    const { 
      barcode, name, category_id, supplier_id, 
      unit_id, unit, price, image_url, reorder_point 
    } = productData;

    const query = `
      INSERT INTO products (barcode, name, category_id, supplier_id, unit_id, unit, price, image_url, reorder_point)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    
    const values = [
      barcode || null, 
      name, 
      category_id || null, 
      supplier_id || null, 
      unit_id || null, 
      unit, 
      price, 
      image_url || null, 
      reorder_point || 0
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // แก้ไขข้อมูลสินค้า
  update: async (id, productData) => {
    const { 
      barcode, name, category_id, supplier_id, 
      unit_id, unit, price, image_url, reorder_point, is_active 
    } = productData;

    const query = `
      UPDATE products 
      SET barcode = $1, name = $2, category_id = $3, supplier_id = $4, 
          unit_id = $5, unit = $6, price = $7, image_url = $8, 
          reorder_point = $9, is_active = $10
      WHERE id = $11
      RETURNING *;
    `;
    
    const values = [
      barcode || null, 
      name, 
      category_id || null, 
      supplier_id || null, 
      unit_id || null, 
      unit, 
      price, 
      image_url || null, 
      reorder_point || 0,
      is_active !== undefined ? is_active : true,
      id
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // ลบสินค้า
  remove: async (id) => {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id;';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
};

module.exports = Product;