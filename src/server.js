const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); // อนุญาตให้ Frontend เชื่อมต่อเข้ามาได้
app.use(express.json()); // ให้ Express อ่านข้อมูลแบบ JSON ได้

// Routes
const branchRoutes = require('./routes/branchRoutes');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');

app.use('/api/branches', branchRoutes); // เปิดใช้งาน API สาขา
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes); // เปิดใช้งาน API เมนู
// Test Route เพื่อตรวจสอบสถานะ
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'Backend API พร้อมทำงาน! รอรับโครงสร้าง Database จากคุณ PPOS ครับ'
    });
});

// ตั้งค่า Port (ดึงจาก .env ถ้าไม่มีให้ใช้ 5000)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[Backend] Server is running on port ${PORT}`);
});