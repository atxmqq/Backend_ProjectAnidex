import express from "express";
import multer from "multer";
import { conn } from "../dbconn";


export const router = express.Router();

//1. Connect Firebase
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDupP2m89Ap3Lnh5-uQQxiAjUYj0mX-ajA",
    authDomain: "project-web-anidex.firebaseapp.com",
    projectId: "project-web-anidex",
    storageBucket: "project-web-anidex.appspot.com",
    messagingSenderId: "290042473892",
    appId: "1:290042473892:web:0466742374bd9310d26531",
    measurementId: "G-7XJL8DJRD2"
};

initializeApp(firebaseConfig);
const storage = getStorage();


class FileMiddleware {
    //Attribute filename
    filename = "";

    //Attribute diskloader
    //Create object of diskloader for saving file
    public readonly diskLoader = multer({
        //storage = define folder(disk) to be saved
        //เซฟลงเอมโมลี่
        storage: multer.memoryStorage(),
        //limit file size
        limits: {
            fileSize: 67108864, // 64 MByte
        },
    });
}


const fileUpload = new FileMiddleware();
router.post("/", fileUpload.diskLoader.single("file"), async (req, res) => {

    //2. Upload File
    const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png" + ".jpg";

    const storageRef = ref(storage, "/images/" + filename)

    const metadata = {
        contentType: req.file!.mimetype
    }

    //Upload to firebase storge
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);

    //Return url of image on firebase storge
    const url = await getDownloadURL(snapshot.ref);
    res.status(200).json({
        file: url
    });
});


//นับจำนวนรูปที่ user อัพโหลด
router.get("/image_count/:uid", (req, res) => {
    const uid = req.params.uid;

    // ตรวจสอบจำนวนรูปภาพของ UID นี้
    conn.query("SELECT COUNT(*) AS image_count FROM pictureAnime WHERE uid = ?", [uid], (err, result) => {
        if (err) {
            console.error("Error checking image count:", err);
            res.status(500).json({ error: "Error checking image count" });
        } else {
            const imageCount = result[0].image_count;
            console.log('Image count:', imageCount);
            res.status(200).json({ image_count: imageCount });
        }
    });
});



router.post("/insertPictureAnime", (req, res) => {
    const { imganime, uid } = req.body; // รับชื่อรูป, ลิงก์รูป, และ uid จากข้อมูลที่ส่งมา

    // ตรวจสอบว่ามีรูปภาพของ UID นี้อยู่เกิน 5 รูปหรือไม่
    conn.query("SELECT COUNT(*) AS image_count FROM pictureAnime WHERE uid = ?", [uid], (err, result) => {
        if (err) {
            console.error("Error checking image count:", err);
            res.status(500).json({ error: "Error checking image count" });
            return;
        }

        const imageCount = result[0].image_count;
        if (imageCount >= 5) {
            // ถ้ามีรูปภาพเต็ม 5 รูปแล้ว ส่งข้อความแจ้งเตือนกลับไปยังผู้ใช้
            res.status(400).json({ error: "Maximum image count reached for this user" });
        } else {
            // ถ้ายังไม่เต็ม 5 รูป ดำเนินการเพิ่มรูปภาพเข้าสู่ฐานข้อมูล
            conn.query(
                "INSERT INTO pictureAnime (imganime, uid) VALUES (?, ?)",
                [imganime, uid],
                (err, result) => {
                    if (err) {
                        console.error("Error inserting image:", err);
                        res.status(500).json({ error: "Error inserting image" });
                    } else {
                        console.log("Image added successfully");
                        res.status(200).json({ message: "Image added successfully" });
                    }
                }
            );
        }
    });
});


router.delete("/deleteimg/:pid", (req, res) => {
    const pid = +req.params.pid;

    //ลบใน vote ก่อน ถ้ามี
    conn.query("DELETE FROM vote WHERE pid_fk = ?", [pid], (err, Result) => {
        if (err) {
            console.error("Error deleting from vote table:", err);
            res.status(500).json({ error: "Error deleting from vote table" });
            return;
        }

        //ลบใน pictureAnime ก่อน ถ้ามี
        conn.query("DELETE FROM pictureAnime WHERE pid = ?", [pid], (err, Result) => {
            if (err) {
                console.error("Error deleting from pictureAnime table:", err);
                res.status(500).json({ error: "Error deleting from pictureAnime table" });
                return;
            }

            res.status(200).json({
                message: "Successfully deleted from pictureAnime and vote tables",
                bigbike_affected_rows: Result.affectedRows,
                vote_affected_rows: Result.affectedRows
            });
        });
    });
});



router.put("/uploadUserProfile/:uid", (req, res) => {
    let uid = +req.params.uid;

    const { imguser } = req.body;

    conn.query('UPDATE `user` SET `imguser`=? WHERE `uid`=?',
        [imguser, uid],
        (err, result) => {
            if (err) {
                res.json(err);
            } else {
                res.json(result);
            }
        });

});

