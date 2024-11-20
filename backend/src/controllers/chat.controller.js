import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

//function to access the chat
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;


    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const existingChat = await Chat.findOne({
            isGroupChat: false,
            users: { $all: [req.user._id, userId] },
        })
            .populate("users", "-password")
            .populate("latestMessage");

        if (existingChat) {
            const populatedChat = await User.populate(existingChat, {
                path: "latestMessage.sender",
                select: "name pic email",
            });
            return res.status(200).json(populatedChat);
        }

        const newChat = new Chat({
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        });

        await newChat.save();

        const populatedChat = await Chat.findById(newChat._id)
            .populate("users", "-password");
        return res.status(200).json(populatedChat);

    } catch (error) {
        throw new ApiError(500, error?.message || "Server error")
    }
});

const fetchChats = asyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({updatedAt: -1})
        .then(async (results) => {
            results = await User.populate(results, {
                path: "'lastMessag.sender",
                select: "name pic email"
            })

            res.status(200).send(results)
        })
    } catch (error) {
        throw new ApiError(400, message?.errror)
    }
})

export {
    accessChat,
    fetchChats
};