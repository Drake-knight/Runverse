import { randomBytes } from "crypto";
import User from "../model/user.js";

export const generateuserID = () => {
    const PREFIX = "CSR";
    const userID = PREFIX + randomBytes(2).toString("hex").toUpperCase();
    return userID;
};

export const getuserID = async () => {
    const currentuserIDs = await User.distinct("userID");

    const getUnique = () => {
        const userID = generateuserID();
        if (currentuserIDs.includes(userID)) {
            return getUnique();
        }
        return userID;
    };
    return getUnique();
};

export default getuserID;
