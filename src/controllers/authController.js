const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
    // API สำหรับสร้างผู้ใช้งานใหม่ (Register)
    register: async (req, res) => {
        try {
            const { username, password, fullname, group_id, branch_id, dept_id } = req.body;
            
            // เข้ารหัสผ่านก่อนบันทึกลง Database
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await UserModel.createUser({
                username, password: hashedPassword, fullname, group_id, branch_id, dept_id
            });
            
            res.status(201).json({ success: true, message: 'สร้างผู้ใช้งานสำเร็จ', data: newUser });
        } catch (error) {
            console.error(error);
            // เช็คกรณี Username ซ้ำ (บั๊กจาก Unique Constraint)
            if (error.code === '23505') {
                return res.status(400).json({ success: false, message: 'มีชื่อผู้ใช้งาน (Username) นี้ในระบบแล้ว' });
            }
            res.status(500).json({ success: false, message: 'ไม่สามารถสร้างผู้ใช้งานได้' });
        }
    },

    // API สำหรับเข้าสู่ระบบ (Login)
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // 1. ค้นหา User ในระบบ
            const user = await UserModel.findByUsername(username);
            if (!user) {
                return res.status(401).json({ success: false, message: 'ไม่พบชื่อผู้ใช้งานนี้' });
            }

            // 2. ตรวจสอบรหัสผ่านว่าตรงกันไหม
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
            }

            // 3. สร้าง JWT Token เพื่อให้ Frontend นำไปใช้ยืนยันตัวตน
            const token = jwt.sign(
                { id: user.id, username: user.username, branch_id: user.branch_id },
                process.env.JWT_SECRET,
                { expiresIn: '1d' } // Token หมดอายุใน 1 วัน
            );

            res.json({ 
                success: true, 
                message: 'เข้าสู่ระบบสำเร็จ', 
                token, 
                data: { id: user.id, username: user.username, fullname: user.fullname } 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};

module.exports = authController;