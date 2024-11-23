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
                select: "fullName image email",
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
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "fullName image email"
                })

                res.status(200).send(results)
            })
    } catch (error) {
        throw new ApiError(400, message?.error)
    }
});


// Creating chat group
const createGroup = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill all the fields" });
    }

    let users = JSON.parse(req.body.users) // converting back to javascript array object
    users.push(req.user)

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const fetchGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        res.status(200).json(fetchGroupChat)

    } catch (error) {
        throw new ApiError(400, message?.error || "Not able to create group chat")
    }
});


// renaming group chat
const renameGroupChat = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId, // The ID of the chat to update
            { chatName: chatName }, // New name for the group chat
            { new: true } // getting back updated chat details
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        res.status(200).json(updatedChat)

    } catch (error) {
        throw new ApiError(405, message?.error || "Chat not found")
    }
});

// adding user to the group chat
const addUser = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        const addedUser = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        res.status(200).json(addedUser)

    } catch (error) {
        throw new ApiError(405, message?.error || "User not added")
    }
});

// removing user from group
const removeUser = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        const removedUser = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        res.status(200).json(removedUser)

    } catch (error) {
        throw new ApiError(405, message?.error || "User not removed")
    }
});

export {
    accessChat,
    fetchChats,
    createGroup,
    renameGroupChat,
    addUser,
    removeUser
};