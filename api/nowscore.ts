import express from "express";
import { conn } from "../dbconn";

export const router = express.Router();


//ดึงผลรวมคะแนนทั้งหมดที่ ไม่รวมปัจจุบัน
router.get("/", (req, res) => {
    const sql = `
            SELECT pictureAnime.*, COALESCE(SUM(CASE WHEN vote.vote_date != CURRENT_DATE THEN vote.score ELSE 0 END), 0) AS total_score 
            FROM pictureAnime 
            LEFT JOIN vote ON pictureAnime.pid = vote.pid_fk 
            GROUP BY pictureAnime.pid;
    `;
    //ใช้ฟังก์ชัน COALESCE เพื่อรับผลลัพธ์ของ SUM ของคะแนนโหวต 
    //โดยใช้ CASE WHEN ในการตรวจสอบว่า vote_date ไม่เท่ากับ CURRENT_DATE (วันปัจจุบัน) 
    //หากเป็นเช่นนั้นจะให้คะแนนที่โหวตได้ ถ้าไม่ใช่จะให้คะแนนเป็น 0
    conn.query(sql, (err, result) => {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});



router.get("/sevenday_before/:pid", (req, res) => {
    const pid = req.params.pid;
    const sql = `
    SELECT 
      pictureAnime.pid AS pid_fk,
      DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq.seq DAY), '%d') AS vote_date,
      COALESCE(SUM(vote.score), 0) AS total_score
    FROM 
      (SELECT 0 AS seq
      UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
      UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS seq
    LEFT JOIN 
        pictureAnime ON pictureAnime.pid = ?
    LEFT JOIN 
        vote ON pictureAnime.pid = vote.pid_fk AND DATE(vote.vote_date) = DATE_SUB(CURDATE(), INTERVAL seq.seq DAY)
    WHERE 
        pictureAnime.pid = ?
    GROUP BY 
        pictureAnime.pid, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq.seq DAY), '%d'), seq.seq
    ORDER BY 
        DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq.seq DAY), '%d') ASC`;

    conn.query(sql, [pid, pid], (err, result) => {
        if (err) {
            console.error("Error fetching total score for bid:", pid, err);
            res.status(500).json({ error: "Error fetching total score" });
        } else {
            // ตรวจสอบว่ามีข้อมูลของ bid ที่ระบุหรือไม่
            if (result.length > 0) {
                // ส่งข้อมูลคะแนนรวมของบิดและคะแนนรวมของ 7 วันย้อนหลังกลับไป
                res.status(200).json(result);
            } else {
                // หากไม่พบข้อมูลของ bid ที่ระบุ
                res.status(404).json({ error: "Bid not found or no votes within the last 7 days" });
            }
        }
    });
});




