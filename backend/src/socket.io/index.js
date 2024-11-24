import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { Message } from "../models/message.model.js";  // Importing Message model
import { Chat } from "../models/chat.model.js";  // Importing Chat model

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
});

const users = [];

function userJoin(id, username, room, user_uuid) {
    const user = { id, username, room, user_uuid };
    users.push(user);
    return user;
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room event
    socket.on('joinRoom', async ({ roomObject }) => {
        console.log('Received roomObject:', roomObject);
    
        if (!roomObject || !roomObject.user || !roomObject.room_uuid) {
            console.error('Invalid room object or user data');
            socket.emit('error', 'Invalid room object or user data');
            return;
        }
    
        const { user: roomUser, room_uuid } = roomObject;
    
        // Log user joining the room
        const joinedUser = userJoin(socket.id, roomUser.name, room_uuid, roomUser.user_uuid);
        socket.join(joinedUser.room);
        socket.emit('message', `Welcome to the room, ${joinedUser.username}`);
        socket.broadcast.to(joinedUser.room).emit('message', `${joinedUser.username} has joined the room`);
    
        const otherUser = getRoomUsers(room_uuid).find(user => user.id !== socket.id);
    
        if (otherUser) {
            try {
                const currentUserName = roomUser.name || 'Unnamed User';
                const otherUserName = otherUser.username || 'Unnamed User';
    
                // Check if the chat already exists between the two users
                let existingChat = await Chat.findOne({
                    isGroupChat: false,
                    users: { $all: [roomUser.user_uuid, otherUser.user_uuid] },
                });
    
                if (!existingChat) {
                    existingChat = new Chat({
                        chatName: `Chat between ${currentUserName} and ${otherUserName}`,
                        isGroupChat: false,
                        users: [roomUser.user_uuid, otherUser.user_uuid],
                        room_uuid: room_uuid,
                    });
    
                    await existingChat.save();
                    console.log('New chat created:', existingChat);
    
                    // Notify both users that a new chat has been created
                    io.to(joinedUser.room).emit('message', `A new chat has been created between ${currentUserName} and ${otherUserName}`);
                } else {
                    console.log('Existing chat found:', existingChat);
                }
            } catch (err) {
                console.error('Error checking or creating chat:', err);
                socket.emit('error', 'Error checking or creating chat');
            }
        }
    
        io.to(joinedUser.room).emit('roomUsers', {
            room: joinedUser.room,
            users: getRoomUsers(joinedUser.room),
        });
    
        io.to(joinedUser.room).emit('roomSettings', { roomObject });
    });
    
    


    // Sending a message
    socket.on('sendMessage', async (messageData) => {
        if (!messageData || !messageData.room || !messageData.sender || !messageData.text) {
            console.error('Invalid message format:', messageData);
            return;
        }
    
        const user = getRoomUsers(messageData.room).find(u => u.id === socket.id);
        if (!user) {
            console.log('User not found in the room');
            return;
        }
    
        console.log(`Message from ${user.username}: ${messageData.text}`);
    
        try {
            const chat = await Chat.findOne({ room_uuid: messageData.room });
    
            if (!chat) {
                console.error('Chat not found for the room:', messageData.room);
                return;
            }
    
            // Save the message to the database
            const newMessage = new Message({
                sender: user.user_uuid,
                text: messageData.text,
                chat: chat._id, 
                msgByUserId: user.user_uuid,
            });
    
            await newMessage.save();
    
            // Broadcast the message to the room
            io.to(messageData.room).emit('message', {
                sender: user.username,
                text: messageData.text,
                timestamp: new Date().toISOString()
            });
    
            socket.emit('message', {
                sender: user.username,
                text: messageData.text,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });
    
    // Handle user disconnect
    socket.on("disconnect", () => {
        const user = users.find(u => u.id === socket.id);
        if (user) {
            socket.leave(user.room);
            users.splice(users.indexOf(user), 1);
            io.to(user.room).emit('message', `${user.username} has left the call`);
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
        console.log('User disconnected:', socket.id);
    });
});

export { app, server };
