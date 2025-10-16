import User from "../models/user.model.js"
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"
import {getReceiverSocketId, io} from "../lib/socket.js"
import { generateEncryptionKey, encryptMessage, decryptMessage, encryptWithPublicKey } from "../lib/encryption.js"

export const getUsersForSidebar = async(req,res) =>{
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password -privateKey");
        res.status(200).json(filteredUsers)
    } catch(error){
        console.log("Error in getUsersForSidebar: ",error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const getMessages = async(req,res) =>{
    try{
        const {id:userToChatId} = req.params; // destructure + rename
        const myId = req.user._id;
        const messages = await Message.find({
            $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId},
            ]
        })
        res.status(200).json(messages)

    } catch(error){
        console.log("Error in getMessages controller: ",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const sendMessage = async(req,res) =>{
    try{
        const {text, image, encryptedText, isEncrypted} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;
        let imageUrl;
        
        if(image){
            // upload base64 image to cloundinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: isEncrypted ? null : text, // Store plain text only if not encrypted
            encryptedText: isEncrypted ? encryptedText : null,
            isEncrypted: isEncrypted || false,
            image: imageUrl,
        })

        await newMessage.save();
        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }

        res.status(201).json(newMessage)

    } catch(error){
        console.log("Error in sendMessage controller: ",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getUserPublicKey = async(req,res) =>{
    try{
        const {id: userId} = req.params;
        const user = await User.findById(userId).select("publicKey");
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        res.status(200).json({publicKey: user.publicKey});
    } catch(error){
        console.log("Error in getUserPublicKey: ",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getMyPrivateKey = async(req,res) =>{
    try{
        const userId = req.user._id;
        const user = await User.findById(userId).select("privateKey");
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        res.status(200).json({privateKey: user.privateKey});
    } catch(error){
        console.log("Error in getMyPrivateKey: ",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}