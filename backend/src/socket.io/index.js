import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

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

    //to join room
    socket.on('joinRoom', ({ roomObject }) => {
        console.log('Received roomObject:', roomObject);

        if (!roomObject || !roomObject.user || !roomObject.room_uuid) {
            console.error('Invalid room object or user data');
            socket.emit('error', 'Invalid room object or user data');
            return;
        }

        const user = userJoin(socket.id, roomObject.user.name, roomObject.room_uuid, roomObject.user.user_uuid);
        socket.join(user.room);

        socket.emit('message', 'Welcome to the application, ' + user.username);
        socket.broadcast.to(user.room).emit('message', `${user.username} has joined the call`);

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        io.to(user.room).emit('roomSettings', { roomObject });
    });

    // sending message
    socket.on('sendMessage', (message) => {
        if (!message || !message.room || !message.sender || !message.content) {
            console.error('Invalid message format:', message);
            return;
        }

        const user = getRoomUsers(message.room).find(u => u.id === socket.id);
        if (!user) {
            console.log('User not found in the room');
            return;
        }

        console.log(`Message from ${user.username}: ${message.content}`);

        io.to(message.room).emit('message', {
            sender: user.username,
            content: message.content,
            timestamp: new Date().toISOString()
        });


        socket.emit('message', {
            sender: user.username,
            content: message.content,
            timestamp: new Date().toISOString()
        });
    });


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


export {
    app,
    server
}