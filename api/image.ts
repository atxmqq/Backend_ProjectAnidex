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
    // คำสั่ง SQL เพื่อดึงข้อมูลรูปภาพที่อัพเดตก่อนวันปัจจุบัน
    const query = `SELECT * FROM pictureAnime WHERE update_date <= CURRENT_DATE`;

    conn.query(query, (err, result) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result);
        }
    });
});

