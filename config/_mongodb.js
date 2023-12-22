import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const MONGO_URI =
    process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URL
        : process.env.MONGODB_URL_DEV;

const dbOptions = {
    autoCreate: true
};

export const connectToMongoDB = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(MONGO_URI, dbOptions);
        console.log("MongoDB is connected successfully");
    } catch (e) {
        console.log("MongoDB connection error", e.message);
        process.exit(-1);
    }
};

