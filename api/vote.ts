import express from "express";
import { conn } from "../dbconn";

export const router = express.Router();

router.get("/", (req, res) => {
    const sql =
        "SELECT pictureAnime.*, SUM(COALESCE(vote.score, 0)) AS total_score FROM pictureAnime LEFT JOIN vote ON pictureAnime.pid = vote.pid_fk GROUP BY pictureAnime.pid";
    conn.query(sql, (err, result) => {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});

