import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import groupRoutes from "./routes/group.route.js"
import groupMessageRoutes from "./routes/groupMessage.js"

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "8mb" }));
app.use(cookieParser());

// Updated CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        process.env.FRONTEND_URL
      ].filter(Boolean);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/groups",groupRoutes);
app.use("/api/group-messages", groupMessageRoutes);

app.get("/", (req, res) => {
  res.send({
    activeStatus: true,
    error: false,
  });
});

// error handler
app.use((req, res, next) => {
  res.status(404).send({ message: "Route Not found" });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Internal Server Error" });
});

server.listen(PORT, () => {
  console.log("Server Running on Port:", PORT);
});
