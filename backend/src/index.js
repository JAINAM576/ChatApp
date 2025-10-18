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

// ✅ Load environment variables FIRST
dotenv.config();

// ✅ Then connect to the database
connectDB();

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "8mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
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
