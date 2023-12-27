import { randomBytes } from "crypto";
import Tree from "../model/tree.js";

// Generate a unique treeID
export const generatetreeID = () => {
    const PREFIX = "TR";
    const treeID = PREFIX + randomBytes(8).toString("hex").toUpperCase();
    return treeID;
};
export const gettreeID = async () => {
    const currenttreeIDs = await Tree.distinct("treeID");
    // Check if the generated treeID is unique
    const getUnique = () => {
        const treeID = generatetreeID();
        if (currenttreeIDs.includes(treeID)) {
            return getUnique();
        }
        return treeID;
    };
    return getUnique();
};

export default gettreeID;
