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
