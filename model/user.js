import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userID: { type: String, unique: true, required: true },
    address: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not an email",
            isAsync: false
        }
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: value => new RegExp(/^(\+\d{1,3} )?(\d+)$/g).test(value),
            message: "Invalid phone number",
            isAsync: false
        }
    },
    adoptedTrees: [
        {
            treeID: {
                type: String,
            },
            tree: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tree",
            },
            adoptedOn: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    resetCode: { type: String, default: null },
    resetCodeExpiration: { type: Date, default: null },
    creationTime: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});

userSchema.pre("save", function (next) {
    const user = this;
    user.lastUpdated = Date.now();
    next();
});

userSchema.pre("updateOne", function (next) {
    const user = this;
    user.lastUpdated = Date.now();
    next();
});

const User = mongoose.model("User", userSchema)
export default User