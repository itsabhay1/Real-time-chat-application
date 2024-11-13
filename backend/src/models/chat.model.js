import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        chatname: {
            type: String,
            trim: true
        },
        isGroupChat: {
            type: Boolean,
            default: true
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
        groupAmin: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
)

export const Chat = mongoose.model("Chat", chatSchema);