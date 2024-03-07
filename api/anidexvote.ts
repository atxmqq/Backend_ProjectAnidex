import express from "express";
import { conn } from "../dbconn";
import cors from "cors";


export const router = express.Router();
router.use(cors());


router.get("/", (req, res) => {
    conn.query('SELECT * FROM vote',
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(result);
            }
        });
});



router.post("/score", (req, res) => {
    const { uid_fk, pid_fk, winlose, score, vote_date } = req.body; // รับค่าพารามิเตอร์จาก request body

    conn.query('INSERT INTO `vote`(`uid_fk`, `pid_fk`, `winlose`, `score`, `vote_date`) VALUES (?, ?, ?, ?, ?)',
        [uid_fk, pid_fk, winlose, score, vote_date], // ใส่ค่าพารามิเตอร์ลงใน array สำหรับ query
        (err, result) => {
            if (err) {
                res.json(err);
            } else {
                res.json(result);
            }
        });
});



