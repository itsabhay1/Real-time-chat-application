import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        text: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        videoUrl: {
            type: String,
        },
        seen: {
            type: Boolean,
            default: false
        },
        msgByUserId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
)

export const Message = mongoose.model("Message", messageSchema);