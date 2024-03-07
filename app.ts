import express from "express";
import { router as index } from "./api/index";
import { router as image } from "./api/image";
import { router as vote } from "./api/vote";
import { router as anidexvote } from "./api/anidexvote";


import bodyParser, { json } from "body-parser";
import cors from "cors";



export const app = express();

app.use(bodyParser.text(), json());

app.use(
    cors({ //api ที่สร้างอนุญาติให้เว็บนี้เข้ามาเรียกเท่านั้น
        origin: "*",
    })
);

app.use("/user", index);

app.use("/image", image);

app.use("/voteimage", vote);

app.use("/anidexvote", anidexvote);



