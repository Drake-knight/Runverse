import User from "../model/user.js";
import Tree from "../model/tree.js";
import { calculateProduceShare } from "../utils/produceShare.js";

const adoptTree = async (req, res) => {
    const userID = req.query.userID;
    const { treeID } = req.body;

    if (!treeID) {
        return res.status(400).json({ message: "Tree ID is required for adoption." });
    }
    if (!userID) {
        return res.status(404).json({ message: "User not found." });
    }

    try {
        const user = await User.findOne({ userID }).exec();

        const isTreeAlreadyAdopted = user.adoptedTrees.some((adoptedTree) => adoptedTree.treeID === treeID);

        if (isTreeAlreadyAdopted) {
            return res.status(400).json({ message: "You have already adopted this tree." });
        }

        const treeToAdopt = await Tree.findOne({ treeID }).exec();
        if (!treeToAdopt) {
            return res.status(404).json({ message: "Tree not found for adoption." });
        }

        await user.adoptedTrees.push({
            treeID: treeToAdopt.treeID,
            tree: treeToAdopt._id,
            adoptedOn: new Date(),
        });

        await user.save();

        treeToAdopt.isAdopted = true;
        treeToAdopt.adoptedBy.push({
            user: user._id,
            userID: userID,
        });
        treeToAdopt.adoptedOn = new Date();

        await treeToAdopt.save();

        res.json({ message: "Tree adopted successfully." });
    } catch (error) {
        if (error.code === 9090) {
            res.status(400).json({ message: "Unauthorized Request" });
        } else {
            res.status(500).json({ message: "An error occured." });
        }
    }
};


const getAdoptedTrees = async (req, res) => {
    try {
        const userID = req.query.userID;

        const user = await User.findOne({ userID }).populate({
            path: "adoptedTrees.tree"
        }
        ).exec();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const adoptedTrees = user.adoptedTrees;
        const treesInfo = adoptedTrees.map((adoptedTree) => ({
            produce: adoptedTree.tree.produce,
            species: adoptedTree.tree.species,
        }));

        res.json({ treesInfo });
    } catch (error) {
        if (error.code === 9090) {
            res.status(400).json({ message: "Unauthorized Request" });
        } else {
            res.status(500).json({ message: "An error occured." });
        }
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().exec();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

const getProduceShare = async (req, res) => {
    try {
        const userID = req.query.userID;
        const species = req.query.species;

        const user = await User.findOne({ userID }).populate({
            path: "adoptedTrees.tree"
        }).exec();

        if (user.adoptedTrees.length === 0) {
            return res.status(400).json({ message: "No Adopted Trees." });
        }

        const filteredAdoptedTrees = user.adoptedTrees.filter((adoptedTree) => adoptedTree.tree.species === species);

        if (filteredAdoptedTrees.length === 0) {
            return res.status(400).json({ message: `No adopted trees for species: ${species}.` });
        }

        const produceShare = calculateProduceShare(filteredAdoptedTrees);

        res.json({ produceShare });
    } catch (error) {
        if (error.code === 9090) {
            res.status(400).json({ message: "Unauthorized Request" });
        } else {
            res.status(500).json({ message: "An error occured." });
        }
    }
};

export default {
    adoptTree,
    getAdoptedTrees,
    getAllUsers,
    getProduceShare,
};