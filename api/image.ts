import express from "express";
import { conn } from "../dbconn";

export const router = express.Router();

//ดูข้อมูลทุกคน
router.get("/", (req, res) => {
    conn.query('SELECT * FROM pictureAnime',
        (err, result) => {
            res.json(result);
        })
})


router.get("/previous", (req, res) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // วันก่อนหน้า

    const formattedYesterday = yesterday.toISOString().split('T')[0]; // แปลงเป็นรูปแบบของ MySQL DATE

    const query = `SELECT * FROM pictureAnime WHERE update_date = '${formattedYesterday}'`; // คำสั่ง SQL เพื่อดึงข้อมูลรูปภาพที่มีวันที่น้อยกว่าเมื่อวาน

    conn.query(query, (err, result) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result);
        }
    });
});