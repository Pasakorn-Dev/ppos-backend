// src/middlewares/permissionMiddleware.js
const db = require('../config/db');

const checkPermission = (menuLink, action) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id; // ได้มาจาก verifyToken

            // 1. หากลุ่ม (group_id) ของ User
            const userRes = await db.query('SELECT group_id FROM public.users WHERE id = $1', [userId]);
            const groupId = userRes.rows[0]?.group_id;

            if (!groupId) return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง (No Group)' });

            // 2. เช็คสิทธิ์จากตาราง group_permissions โดยอ้างอิงจาก link ของเมนู
            const permRes = await db.query(`
                SELECT gp.can_add, gp.can_edit, gp.can_delete
                FROM public.group_permissions gp
                JOIN public.menus m ON gp.menu_id = m.id
                WHERE gp.group_id = $1 AND m.link = $2
            `, [groupId, menuLink]);

            const perm = permRes.rows[0];
            if (!perm) return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์เข้าถึงเมนูนี้' });

            // 3. ตรวจสอบตาม action ที่ส่งมา
            let hasAccess = false;
            if (action === 'add') hasAccess = perm.can_add;
            if (action === 'edit') hasAccess = perm.can_edit;
            if (action === 'delete') hasAccess = perm.can_delete;

            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'ปฏิเสธการเข้าถึง: คุณไม่มีสิทธิ์ทำรายการนี้' });
            }
            
            next(); // มีสิทธิ์ -> ให้ผ่านไปทำ API ถัดไปได้
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server Error (Check Permissions)' });
        }
    };
};

module.exports = checkPermission;