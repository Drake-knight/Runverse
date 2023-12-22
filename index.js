import { connectToMongoDB } from "./config//_mongodb.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import apiRouter from "./routes/Routes.js";

const app = express();

const PORT = process.env.PORT || 5100;

const main = async () => {
    await connectToMongoDB();

    app.use(
        cors({
            credentials: true,
            origin: [
                /https?:\/\/localhost:\d{4}/,
            ]
        })
    );

    app.use(cookieParser());
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
