import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../model/user.js";
import Tree from "../model/tree.js";
import dotenv from "dotenv";
import getUserID from "../utils/getUserID.js";
import { sendMail } from "../utils/email.js";
import { calculateProduceShare } from "../utils/produceShare.js";
dotenv.config();
const CSR_SECRET = process.env.CSR_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const EMAIL_SECRET = process.env.EMAIL_SECRET;
const CSR_AUTH_TOKEN = process.env.CSR_AUTH_TOKEN;
const CSR_USER = process.env.CSR_USER;

//setting cookies in user's PC locally.
const setCookies = (res, data) => {
    const { participatedEvents, ...forToken } = data;
    const token = jwt.sign(forToken, CSR_SECRET);  ///, { expiresIn: '1h' }

    // Secure the cookie (check if it was set with the domain mentioned and not locally)
    const opts = IS_PRODUCTION
        ? {
            domain: "https://runverve.onrender.com"
        }
        : {};

    res.cookie(CSR_AUTH_TOKEN, token, {
        secure: IS_PRODUCTION,
        httpOnly: true,
        ...opts
    });

    res.cookie(CSR_USER, JSON.stringify(data), {
        secure: IS_PRODUCTION,
        ...opts
    });
};


//Verification route
const verifyAndSendMail = async (req, res) => {
    const email = req.query.email;
    try {
        const user = await User.find({ email: email.toLowerCase() }).exec();
        if (user.length !== 0) {
            res.status(400).json({
                message: `The email, ${email} is already associated with another account.`
            });
            return;
        }

        const encryptedEmail = crypto
            .createHmac("sha1", EMAIL_SECRET)
            .update(email)
            .digest("hex")
            .substring(0, 6);

        try {
            await sendMail(email, "email-verification", {
                verificationCode: encryptedEmail
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Mail coudn't be sent. Please try again." });
        }

        return res.json({ message: "Verification Email sent" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "An error occurred" });
    }
};

//Register Route
const register = async (req, res) => {
    try {
        const { verificationCode } = req.body;

        //Encrypting user's email
        //Verification Code being sent to user is the mail he entered which is also encrypted using the same algorithm.
        const encryptedEmail = crypto
            .createHmac("sha1", EMAIL_SECRET)
            .update(req.body.email)
            .digest("hex")
            .substring(0, 6);

        //Timing safe comparisons which provides a constant-time comparison that is not vulnerable to timing attacks
        const isVerified = crypto.timingSafeEqual(
            Buffer.from(encryptedEmail),
            Buffer.from(verificationCode)
        );

        if (!isVerified) {
            const verificationError = new Error("Wrong verification code");
            verificationError.code = 400;
            throw verificationError;
        }

        const user = new User({
            ...req.body,
            email: req.body.email.toLowerCase(),
            password: await bcrypt.hash(req.body.password, 10),
        });

        user.userID = await getUserID();
        await user.save();

        const { name, _id, email, userID } = user.toObject();
        setCookies(res, {
            name,
            _id,
            email,
            userID,
        });

        await sendMail(email, "welcome", { name, userID })

        res.json({ userID, name });
    } catch (error) {
        console.log(error.code);

        if (error.code === 11000) {
            const dupEmail = !!error.keyValue.email && error.keyValue.email;
            const dupPhone = !!error.keyValue.phone && error.keyValue.phone;
            const dupuserID = !!error.keyValue.userID && error.keyValue.userID;

            if (dupEmail) {
                return res.status(400).json({
                    message: `The email, ${dupEmail} is already associated to another registered account. Please use another email.`
                });
            }
            if (dupPhone) {
                return res.status(400).json({
                    message: `The phone Number, ${dupPhone} is already associated to another registered account. Please use another number.`
                });
            }
            if (dupuserID) {
                await this.register(req, res);
            }
        }
        if (error.code === 400) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message });
    }
};

// Login Route
const login = async (req, res) => {
    if (!Object.keys(req.body).length) {
        return res.status(400).json({ message: "Unauthorized" });
    }

    const { password } = req.body;
    const passOrID = req.body.passOrID;

    if (!passOrID) {
        return res.status(400).json({ message: "Please Enter your Email or User ID" });
    }

    try {
        const user = await User.findOne({
            $or: [{ email: passOrID.toLowerCase() }, { userID: passOrID }],
        }).exec();

        if (!user) {
            return res.status(400).json({ message: "No user was found with the provided credentials." });
        }

        const verifyPassword = await bcrypt.compare(password, user.password);

        if (!verifyPassword) {
            return res.status(401).json({ message: "The password is incorrect." });
        }

        const { name, _id, email, userID } = user.toObject();

        setCookies(res, { name, _id, email, userID });

        return res.json({
            userID: user.userID,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "An error occurred" });
    }
};

//Reset Pass Routes
const resetPasswordMail = async (req, res) => {
    try {
        const email = req.query.email;
        const user = await User.findOne({ email }).exec();

        if (!user) {
            res.status(400).json({ message: "No account was found with the E-Mail." });
            return;
        }

        const pw = user.password;
        const resetCode = crypto.createHash("md5").update(pw).digest("hex").substring(0, 6);

        user.resetCode = resetCode;
        user.resetCodeExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hr

        await user.save();

        try {
            await sendMail(email, "password-reset", {
                name: user.name,
                code: resetCode,
            });
        } catch (error) {
            return res.status(500).json({ message: "An error occurred" });
        }

        res.json({ message: "E-Mail sent." });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "An error occurred" });
    }
};

const resetPasswordFromCode = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;

    try {
        const user = await User.findOne({ email }).exec();

        if (!user) {
            res.status(400).json({ message: "No account was found with the E-Mail." });
            return;
        }

        const codeFromUser = crypto.createHash("md5").update(user.password).digest("hex").substring(0, 6);
        const resetCodeCorrect = codeFromUser === resetCode && user.resetCodeExpiration > new Date();
        if (resetCodeCorrect) {
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = newHashedPassword;
            user.resetCode = null;
            user.resetCodeExpiration = null;
            await user.save();
            res.json({ message: "Password updated successfully!" });
        } else {
            res.status(400).json({ message: "Reset code is incorrect or expired" });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "An error occurred" });
    }
};


//Logout
const logout = async (req, res) => {
    try {
        const opts = IS_PRODUCTION
            ? {
                domain: "https://runverve.onrender.com"
            }
            : {};

        //Clear all the Cookies that was set
        res.clearCookie(CSR_AUTH_TOKEN, {
            secure: IS_PRODUCTION,
            httpOnly: true,
            ...opts
        });

        res.clearCookie(CSR_USER, {
            secure: IS_PRODUCTION,
            ...opts
        });
        res.json({ message: "Logged Out" });
    } catch (error) {
        if (error.code === 9090) {
            res.status(400).json({ message: "Unauthorized Request" });
        } else {
            res.status(500).json({ message: "An error occured." });
        }
    }
};

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
    verifyAndSendMail,
    register,
    login,
    resetPasswordMail,
    resetPasswordFromCode,
    logout,
    adoptTree,
    getAdoptedTrees,
    getAllUsers,
    getProduceShare,
};