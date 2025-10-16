import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import {getUsersForSidebar,getMessages,sendMessage,getUserPublicKey,getMyPrivateKey,pinChat,unpinChat,getPinnedChats} from "../controllers/message.controller.js"

const router = express.Router();

router.get("/users",protectRoute,getUsersForSidebar);
router.get("/:id",protectRoute,getMessages);
router.get("/publickey/:id",protectRoute,getUserPublicKey);
router.get("/privatekey/me",protectRoute,getMyPrivateKey);
router.get("/pinned/chats",protectRoute,getPinnedChats);

router.post("/send/:id",protectRoute, sendMessage);
router.post("/pin/:id",protectRoute, pinChat);
router.post("/unpin/:id",protectRoute, unpinChat);

export default router;