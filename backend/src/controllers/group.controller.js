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

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const updatedMembers = new Set([
      ...group.members.map((id) => id.toString()),
      ...userIds,
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
