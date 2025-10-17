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

export const pinChat = async(req, res) => {
    try {
        const { id: userToPinId } = req.params;
        const userId = req.user._id;

        // Check if user exists
        const userToPin = await User.findById(userToPinId);
        if (!userToPin) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if chat is already pinned
        const user = await User.findById(userId);
        if (user.pinnedChats.includes(userToPinId)) {
            return res.status(400).json({ error: "Chat is already pinned" });
        }

        // Add to pinned chats
        await User.findByIdAndUpdate(
            userId,
            { $push: { pinnedChats: userToPinId } },
            { new: true }
        );

        res.status(200).json({ message: "Chat pinned successfully" });
    } catch (error) {
        console.log("Error in pinChat controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const unpinChat = async(req, res) => {
    try {
        const { id: userToUnpinId } = req.params;
        const userId = req.user._id;

        // Remove from pinned chats
        await User.findByIdAndUpdate(
            userId,
            { $pull: { pinnedChats: userToUnpinId } },
            { new: true }
        );

        res.status(200).json({ message: "Chat unpinned successfully" });
    } catch (error) {
        console.log("Error in unpinChat controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPinnedChats = async(req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId)
            .populate('pinnedChats', '-password -privateKey')
            .select('pinnedChats');
        
        res.status(200).json(user.pinnedChats || []);
    } catch (error) {
        console.log("Error in getPinnedChats controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /messages/archive/:id
export const archiveChat = async (req, res) => {
  try {
    const { id: chatUserId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.archivedChats?.includes(chatUserId)) {
      return res.status(400).json({ error: "Chat is already archived" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $push: { archivedChats: chatUserId } },
      { new: true }
    );

    res.status(200).json({ message: "Chat archived successfully" });
  } catch (error) {
    console.log("Error in archiveChat:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /messages/unarchive/:id
export const unarchiveChat = async (req, res) => {
  try {
    const { id: chatUserId } = req.params;
    const userId = req.user._id;

    await User.findByIdAndUpdate(
      userId,
      { $pull: { archivedChats: chatUserId } },
      { new: true }
    );

    res.status(200).json({ message: "Chat unarchived successfully" });
  } catch (error) {
    console.log("Error in unarchiveChat:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /messages/archived/chats
export const getArchivedChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate("archivedChats", "-password -privateKey")
      .select("archivedChats");

    res.status(200).json(user.archivedChats || []);
  } catch (error) {
    console.log("Error in getArchivedChats:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
