import Group from "../models/group.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const createdBy = req.user._id;

    if (!name)
      return res.status(400).json({ message: "Group name is required" });

    const allMembers = [createdBy];

    const group = await Group.create({
      name,
      createdBy,
      members: allMembers,
    });

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;
    const {user} = req;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if(group.admin === user._id){
      return res.status(401).json({message:"Unauthorized operation"})
    }

    const updatedMembers = new Set([
      ...group.members.map((id) => id.toString()),
      userIds,
    ]);
    group.members = Array.from(updatedMembers);

    await group.save();

    res.json({
      success: true,
      message: "Members added successfully",
      members: group.members,
    });
  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;
    const { user } = req;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized operation" });
    }

    if (group.admin.toString() === userIds.toString()) {
      return res.status(400).json({ message: "Admin cannot be removed" });
    }

    const updatedMembers = group.members.filter(
      (memberId) => memberId.toString() !== userIds.toString()
    );

    group.members = updatedMembers;
    await group.save();

    res.json({
      success: true,
      message: "Members removed successfully",
      members: group.members,
    });
  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: { $in: [userId] } })
      .populate("createdBy", "fullName email profilePic")
      .populate("members", "fullName email profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (error) {
    console.error("❌ Error fetching user groups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { user } = req;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group.members.includes(user._id)) {
      return res
        .status(401)
        .json({ message: "You are not a member of this group" });
    }

    if (group.admin.toString() === user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Admin cannot leave the group directly" });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== user._id.toString()
    );

    await group.save();
    res.json({
      success: true,
      message: "Left group successfully",
      members: group.members,
    });
  } catch (error) {
    console.error("❌ Error leaving group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
