import mongoose from "mongoose";

const treeSchema = new mongoose.Schema({
    species: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    isAdopted: {
        type: Boolean,
        default: false,
    },
    adoptedBy: [
        {
            user: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'User',
            },
            userID: {
                type: String,
            }

        }],
    adoptedOn: {
        type: Date,
        default: null,
    },
    treeID: {
        type: String,
        required: true,
        unique: true,
    },
    produce: { type: Number, default: 0 },
});

const Tree = mongoose.model('Tree', treeSchema);

export default Tree;
