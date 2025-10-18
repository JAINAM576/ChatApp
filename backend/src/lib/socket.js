import {Server} from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin:process.env.FRONTEND_URL || "http://localhost:5173",
        credentials:true,
    }
})

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId:socketId}

// used to store typing users
const typingUsers = {}; // {userId: receiverId}

io.on("connection",(socket) => {
    console.log("A user connected",socket.id);
    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;
    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    // Handle typing events
    socket.on("startTyping", ({ receiverId }) => {
        if (userId && receiverId) {
            typingUsers[userId] = receiverId;
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", { userId });
            }
        }
    });

    socket.on("stopTyping", ({ receiverId }) => {
        if (userId && typingUsers[userId] === receiverId) {
            delete typingUsers[userId];
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStopTyping", { userId });
            }
        }
    });

    socket.on("disconnect",async() => {
        console.log("A user disconnected",socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // Update last seen
        if (userId) {
            await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        }

        // Clean up typing status
        if (typingUsers[userId]) {
            const receiverId = typingUsers[userId];
            delete typingUsers[userId];
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStopTyping", { userId });
            }
        }
    })
})

export {io, app, server};