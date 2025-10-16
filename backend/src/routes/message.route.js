import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import {getUsersForSidebar,getMessages,sendMessage,getUserPublicKey,getMyPrivateKey} from "../controllers/message.controller.js"

const router = express.Router();

router.get("/users",protectRoute,getUsersForSidebar);
router.get("/:id",protectRoute,getMessages);
router.get("/publickey/:id",protectRoute,getUserPublicKey);
router.get("/privatekey/me",protectRoute,getMyPrivateKey);

router.post("/send/:id",protectRoute, sendMessage);

export default router;