import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const allMessages = asyncHandler(async (req, res) => {
  try {
    // Fetching messages for a given chatId and populating relevant fields
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "fullName image email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
});


const sendMessage = asyncHandler(async (req, res) => {
  // console.log("Request body:", req.body);
  // console.log("Uploaded file:", req.file);

  const { text, chatId } = req.body;
  let { imageUrl, videoUrl } = req.body;

  if (!text || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  // Handle image file if uploaded
  if (req.files && req.files.image) {
    const imageBuffer = req.files.image[0].buffer;
    const cloudinaryResponse = await uploadOnCloudinary(imageBuffer, 'image');

    if (cloudinaryResponse) {
      imageUrl = cloudinaryResponse.secure_url;
    } else {
      return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
    }
  }

  // Handle video file if uploaded
  if (req.files && req.files.video) {
    const videoBuffer = req.files.video[0].buffer;
    const cloudinaryResponse = await uploadOnCloudinary(videoBuffer, 'video');

    if (cloudinaryResponse) {
      videoUrl = cloudinaryResponse.secure_url; 
    } else {
      return res.status(500).json({ error: "Failed to upload video to Cloudinary" });
    }
  }

  // Creating a new message object
  const newMessage = {
    sender: req.user._id,
    text: text,
    chat: chatId,
    imageUrl: imageUrl || null,
    videoUrl: videoUrl || null,
    msgByUserId: req.user._id
  };

  try {
    let message = await Message.create(newMessage);

    // Populate sender and chat details after creation
    message = await message.populate("sender", "fullName image")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "fullName image email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
});

export {
  allMessages,
  sendMessage
};
