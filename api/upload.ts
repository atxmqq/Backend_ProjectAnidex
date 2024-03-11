import express from "express";
import multer from "multer";

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