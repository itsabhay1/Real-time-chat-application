import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        chatName: {
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
        groupAdmin: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        room_uuid: {
            type: String, 
            unique: true
        }
    },
    {
        timestamps: true
    }
)

export const Chat = mongoose.model("Chat", chatSchema);