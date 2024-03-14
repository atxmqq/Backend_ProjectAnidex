import express from "express";
import { conn } from "../dbconn";

export const router = express.Router();

router.get("/", (req, res) => {
    const sql = `
        SELECT pictureAnime.*, COALESCE(SUM(CASE WHEN vote.vote_date != CURRENT_DATE THEN vote.score ELSE 0 END), 100) AS total_score 
        FROM pictureAnime 
        LEFT JOIN vote ON pictureAnime.pid = vote.pid_fk 
        GROUP BY pictureAnime.pid;
    `;
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
            pictureAnime.pid,
            DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq.seq DAY), '%Y-%m-%d') AS voting_day,
            COALESCE(SUM(vote.score), 0) AS total_score_last_7_days
        FROM (
            SELECT 0 AS seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
        ) AS seq
        LEFT JOIN vote ON DATE(vote.vote_date) = DATE(DATE_SUB(CURDATE(), INTERVAL seq.seq DAY)) AND vote.pid_fk = ?
        LEFT JOIN pictureAnime ON pictureAnime.pid = vote.pid_fk
        GROUP BY voting_day, pictureAnime.pid
        ORDER BY voting_day ASC;
    `;
    conn.query(sql, [pid], (err, result) => {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});




