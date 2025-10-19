import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useEncryptionStore } from "./useEncryptionStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  groupMessages: [],
  addGroup: "",
  pinnedChats: [],
  archivedChats: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  userLastSeen: {},
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  isGroupCreating: false,

  getUsers: async (q) => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users", {
        params: q ? { q } : undefined,
      });
      const users = res.data;
      // Update last seen for each user
      const lastSeenUpdates = {};
      users.forEach((user) => {
        if (user.lastSeen) {
          lastSeenUpdates[user._id] = user.lastSeen;
        }
      });
      set({
        users,
        userLastSeen: { ...get().userLastSeen, ...lastSeenUpdates },
      });
      // Also get pinned chats
      await get().getPinnedChats();
      await get().getArchivedChats();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getArchivedChats: async () => {
    try {
      const res = await axiosInstance.get("/messages/archived/chats");
      // assuming backend returns an array of user IDs or user objects
      const archivedIds = res.data.map((chat) => (chat._id ? chat._id : chat));
      set({ archivedChats: archivedIds });
    } catch (error) {
      console.error("Failed to fetch archived chats:", error);
    }
  },
  getPinnedChats: async () => {
    try {
      const res = await axiosInstance.get("/messages/pinned/chats");
      set({ pinnedChats: res.data });
    } catch (error) {
      console.error("Error getting pinned chats:", error);
    }
  },

  pinChat: async (userId) => {
    try {
      await axiosInstance.post(`/messages/pin/${userId}`);
      const { pinnedChats } = get();
      const userToPin = get().users.find((user) => user._id === userId);
      if (userToPin && !pinnedChats.find((chat) => chat._id === userId)) {
        set({ pinnedChats: [...pinnedChats, userToPin] });
      }
      toast.success("Chat pinned successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to pin chat");
    }
  },

  archiveChat: async (userId) => {
    try {
      await axiosInstance.post(`/messages/archive/${userId}`); // backend endpoint
      const { archivedChats } = get();
      set({ archivedChats: [...archivedChats, userId] });
      toast.success("Chat archived successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to archive chat");
    }
  },

  unpinChat: async (userId) => {
    try {
      await axiosInstance.post(`/messages/unpin/${userId}`);
      const { pinnedChats } = get();
      set({ pinnedChats: pinnedChats.filter((chat) => chat._id !== userId) });
      toast.success("Chat unpinned successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to unpin chat");
    }
  },

  unarchiveChat: async (userId) => {
    try {
      await axiosInstance.post(`/messages/unarchive/${userId}`); // backend endpoint
      const { archivedChats } = get();
      set({ archivedChats: archivedChats.filter((id) => id !== userId) });
      toast.success("Chat unarchived successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to unarchive chat");
    }
  },

  isChatPinned: (userId) => {
    const { pinnedChats } = get();
    return pinnedChats.some((chat) => chat._id === userId);
  },

  isChatArchived: (userId) => {
    const { archivedChats } = get();
    return archivedChats.includes(userId);
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const messages = res.data;

      // Decrypt encrypted messages
      const decryptedMessages = await Promise.all(
        messages.map(async (message) => {
          if (message.isEncrypted && message.encryptedText) {
            try {
              const decryptedText = await useEncryptionStore
                .getState()
                .decryptReceivedMessage(
                  message.encryptedText,
                  message.senderId
                );
              return { ...message, text: decryptedText };
            } catch (error) {
              console.error("Failed to decrypt message:", error);
              return {
                ...message,
                text: "[Encrypted message - unable to decrypt]",
              };
            }
          }
          return message;
        })
      );

      set({ messages: decryptedMessages });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      // Encrypt message if text is provided
      let finalMessageData = { ...messageData };

      if (messageData.text) {
        const encryptionResult = await useEncryptionStore
          .getState()
          .encryptMessageForSending(messageData.text, selectedUser._id);
        finalMessageData = { ...messageData, ...encryptionResult };
      }

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        finalMessageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.messages);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", async (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;

      // Decrypt message if it's encrypted
      if (newMessage.isEncrypted && newMessage.encryptedText) {
        try {
          const decryptedText = await useEncryptionStore
            .getState()
            .decryptReceivedMessage(
              newMessage.encryptedText,
              newMessage.senderId
            );
          newMessage.text = decryptedText;
        } catch (error) {
          console.error("Failed to decrypt received message:", error);
          newMessage.text = "[Encrypted message - unable to decrypt]";
        }
      }

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("messageUpdated", (updated) => {
      set({
        messages: get().messages.map((m) =>
          m._id === updated._id ? updated : m
        ),
      });
    });

    socket.on("messageDeleted", ({ _id }) => {
      set({ messages: get().messages.filter((m) => m._id !== _id) });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageUpdated");
    socket.off("messageDeleted");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  editMessage: async (messageId, newText) => {
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, {
        text: newText,
      });
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? res.data : m
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to edit message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      set({ messages: get().messages.filter((m) => m._id !== messageId) });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    }
  },

  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      set({ groups: res.data.groups || [] });
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  addGroup: async (groupData) => {
    set({ isGroupCreating: true });
    try {
      const res = await axiosInstance.post("/groups/create", groupData, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success(res.data.message || "Group created successfully!");

      await get().getGroups();
      return res.data.group;
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      set({ isGroupCreating: false });
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/group-messages/${groupId}`);
      set({ groupMessages: res.data.messages || [] });
    } catch (error) {
      console.error("Error fetching group messages:", error);
      toast.error(
        error.response?.data?.message || "Failed to load group messages"
      );
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    try {
      const res = await axiosInstance.post(
        `/group-messages/send/${groupId}`,
        messageData
      );
      // Immediately reflect the sent message for the sender to avoid waiting for socket echo
      // set({ groupMessages: [...get().groupMessages, res.data] });
    } catch (error) {
      console.error("Error sending group message:", error);
      toast.error(
        error.response?.data?.message || "Failed to send group message"
      );
    }
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;
    const socket = useAuthStore.getState().socket;

    socket.on("newGroupMessage", (newMessage) => {
      if (newMessage.groupId !== selectedGroup._id) return;

      const { groupMessages } = get();
      const currentUser = useAuthStore.getState().authUser;
      if (newMessage.senderId === currentUser._id) {
        return;
      }

      const exists = groupMessages.some((msg) => msg._id === newMessage._id);
      if (exists) {
        return;
      }
      set({ groupMessages: [...groupMessages, newMessage] });
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newGroupMessage");
  },

  addGroupMembers: async (groupId, userIds) => {
    try {
      const res = await axiosInstance.post(
        `/groups/${groupId}/add-members`,
        { userIds },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(res.data.message || "Members added successfully!");

      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId
            ? { ...group, members: res.data.members }
            : group
        ),
      }));

      return res.data;
    } catch (error) {
      console.error("Error adding members:", error);
      toast.error(error.response?.data?.message || "Failed to add members");
    }
  },

  removeGroupMembers: async (groupId, userIds) => {
    try {
      const res = await axiosInstance.post(
        `/groups/${groupId}/remove-members`,
        { userIds },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(res.data.message || "Members removed successfully!");

      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId
            ? { ...group, members: res.data.members }
            : group
        ),
      }));
      return res.data;
    } catch (error) {
      console.error("Error removing members:", error);
      toast.error(error.response?.data?.message || "Failed to remove members");
    }
  },

  leaveGroup: async (groupId) => {
    try {
      const res = await axiosInstance.post(
        `/groups/${groupId}/leave-group`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(res.data.message || "You have left the group!");
      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId
            ? { ...group, members: res.data.members }
            : group
        ),
      }));

      return res.data;
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  },
}));
