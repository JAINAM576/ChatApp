import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"
import {getUserGroups, createGroup, addMembers} from "../controllers/group.controller.js"

const router = express.Router();
router.post("/create", protectRoute, createGroup);
router.post("/:groupId/add-members", protectRoute, addMembers);
router.get("/my-groups", protectRoute, getUserGroups);

export default router;