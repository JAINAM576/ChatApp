import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import {connectDB} from "./lib/db.js"
import cors from 'cors'
import {app,server} from "./lib/socket.js"

// const app = express();

dotenv.config()
const PORT = process.env.PORT

app.use(express.json({limit: "8mb"}));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use("/api/auth", authRoutes);
app.use("/api/messages",messageRoutes);

app.get('/',(req,res)=>{
    res.send({
        activeStatus:true,
        error:false,
    })
})

server.listen(PORT,() => {
    console.log("Server Running on Port: "+PORT);
    connectDB()
})