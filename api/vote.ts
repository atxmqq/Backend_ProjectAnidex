import express from "express";
import { conn } from "../dbconn";

export const router = express.Router();

router.get("/", (req, res) => {
    const sql = "select pictureAnime.*, vote.*, COALESCE(vote.score, 100) AS score FROM pictureAnime LEFT JOIN vote ON pictureAnime.pid = vote.pid_fk";
    conn.query(sql, (err, result) => {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});



