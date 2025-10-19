import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import {getUserGroups, createGroup, addMembers, removeMembers, leaveGroup} from "../controllers/group.controller.js"

const router = express.Router();
router.post("/create", protectRoute, createGroup);
router.post("/:groupId/add-members", protectRoute, addMembers);
router.post("/:groupId/remove-members", protectRoute, removeMembers);
router.get("/my-groups", protectRoute, getUserGroups);
router.post("/:groupId/leave-group", protectRoute, leaveGroup);

export default router;