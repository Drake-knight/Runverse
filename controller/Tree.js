import Tree from "../model/tree.js";
import getTreeID from "../utils/getTreeID.js";
import User from "../model/user.js";
import { calculateProduceShare } from "../utils/produceShare.js";
const addTree = async (req, res) => {
    try {
        const treeID = await getTreeID();

        const { species, age } = req.body;

        const newTree = new Tree({
            treeID,
            species,
            age,
        });

        await newTree.save();

        res.status(201).json({ message: "Tree added successfully", tree: newTree });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getAdoptedByUser = async (req, res) => {
    try {
        const treeID = req.query.treeID;

        const tree = await Tree.findOne({ treeID }).populate("adoptedBy", "name email").exec();

        if (!tree) {
            return res.status(404).json({ message: "Tree not found" });
        }

        const adoptedByUser = tree.adoptedBy;

        res.json({ adoptedByUser });
    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
    }
};

const getAllTrees = async (req, res) => {
    try {
        const trees = await Tree.find().exec();
        res.json(trees);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
};

const updateProduce = async (req, res) => {
    try {
        const treeID = req.query.treeID;
        const { newProduceValue } = req.body;
        console.log(treeID)
        console.log(req.query)
        const updatedTree = await Tree.findOneAndUpdate(
            { treeID: treeID },
            { produce: newProduceValue },
            { new: true }
        );

        if (!updatedTree) {
            return res.status(404).json({ message: 'Tree not found' });
        }

        res.json({ updatedTree });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

const getProduceShareBySpecies = async (req, res) => {
    try {
        const species = req.query.species;

        if (!species) {
            return res.status(400).json({ message: "Species is required." });
        }

        const users = await User.find().populate({
            path: "adoptedTrees.tree"
        }).exec();
        console.log(users)
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }

        const usersWithProduceShare = [];

        for (const user of users) {
            const adoptedTreesForSpecies = user.adoptedTrees.filter(
                (adoptedTree) => adoptedTree.tree.species === species
            );

            if (adoptedTreesForSpecies.length > 0) {
                const produceShare = calculateProduceShare(adoptedTreesForSpecies);

                usersWithProduceShare.push({
                    userID: user.userID,
                    produceShare: produceShare.userSharePercentage,
                });
            }
        }

        res.json({ usersWithProduceShare });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
    }
};


export default {
    addTree,
    getAllTrees,
    getAdoptedByUser,
    updateProduce,
    getProduceShareBySpecies
};
