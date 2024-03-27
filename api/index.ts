import express from "express";
import { conn } from "../dbconn";
import cors from "cors";
var jwt = require('jsonwebtoken');
const genToken = 'Gentoken for login' //ตัวเจ็น token
import multer from 'multer'; // เรียกใช้ multer เพื่ออัปโหลดไฟล์


export const router = express.Router();

// ให้ Express ใช้ CORS middleware ที่ตั้งค่าไว้
router.use(cors());

//ดูข้อมูลทุกคน
router.get("/", (req, res) => {
    conn.query('SELECT * FROM user',
        (err, result) => {
            res.json(result);
        })
})

//login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM user WHERE username = ? AND password = ?";

    conn.query(
        sql,
        [username, password],
        (err, result) => {
            if (err) {
                res.json({ status: "error", message: err });
                return;
            }
            if (result.length == 0) {
                res.json({ status: "error", message: "no user found" });
                return;
            }

            var token = jwt.sign({ username: result[0].username }, genToken, { expiresIn: '1h' });
            res.json({ result: true, message: "login success", token });

        }
    );
})


//register
router.post("/register", (req, res) => {
    const { username, email, password } = req.body

    const query = 'INSERT INTO user (username, password, email, type) VALUES (?, ?, ?, ?)';

    conn.query(query, [username, password, email, 'user'], (error, result) => {
        if (error) {
            return res.json({ error: 'Error register' })
        }
        res.json({ success: true, user: result, massage: "Register successful" });

    })
});


//เช็ค token ว่าตรงมั้ย
router.post('/authen', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        var decoded = jwt.verify(token, genToken);
        res.json({ status: 'ok', decoded });
    } catch {
        res.json({ status: 'error' });
    }
});

router.get("/:uid", (req, res) => {
    let uid = +req.params.uid;

    conn.query('SELECT * FROM user WHERE uid = ?',
        [uid],
        (err, result) => {
            if (err) {
                console.error('Error retrieving user:', err);
                res.status(500).json({ error: 'Error retrieving user' });
            } else {
                res.json(result);
            }
        });
});

//
router.get("/:token", (req, res) => {
    const token = req.params.token; //รับ token จากพารามิเตอร์ URL
    try {
        var decoded = jwt.verify(token, genToken);

        conn.query("SELECT * FROM user WHERE username = ?", [decoded.username], (err, result) => {
            if (err) {
                console.log('Error:', err);
                res.json({ status: "error", massage: "Internet Server Error" });
                return;
            }
            if (result.length == 0) {
                res.json({ status: "error", massage: "User not found" });
                return;
            }
            res.json(result[0]);
        });
    } catch (error) {
        console.log('Error:', error);

    }
});



router.put("/editProfile/:uid", (req, res) => {
    let uid = +req.params.uid;

    const { username, password } = req.body;

    conn.query('UPDATE `user` SET `username`=?, `password`=? WHERE `uid`=?',
        [username, password, uid],
        (err, result) => {
            if (err) {
                res.json(err);
            } else {
                res.json(result);
            }
        });

});


