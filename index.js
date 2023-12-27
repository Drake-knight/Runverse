import { connectToMongoDB } from "./config/_mongodb.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import apiRouter from "./routes/Routes.js";
import dotenv from 'dotenv';
dotenv.config();


const app = express();

const PORT = process.env.PORT || 5100;

const main = async () => {
    await connectToMongoDB();

    app.use(
        cors({
            credentials: true,
            origin: [
                /https?:\/\/localhost:\d{4}/,
                "https://github.com/"
            ]
        })
    );

    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(
        helmet({
            referrerPolicy: {
                policy: "no-referrer-when-downgrade"
            }
        })
    );

    app.use("/", apiRouter);

    app.listen(PORT, () => {
        console.info(`Express HTTP server running at ${PORT}`);
    });
};

main();
