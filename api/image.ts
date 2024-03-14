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


router.get("/:pid", (req, res) => {
    let pid = +req.params.pid;

    conn.query('SELECT * FROM pictureAnime WHERE `pid`=?',
        [pid],
        (err, result) => {
            res.json(result);
        })
})



