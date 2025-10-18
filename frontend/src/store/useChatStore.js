import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useEncryptionStore } from "./useEncryptionStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  pinnedChats: [],
  archivedChats: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  userLastSeen: {},

  getUsers: async (q) => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users", {
        params: q ? { q } : undefined,
      });
      const users = res.data;
      // Update last seen for each user
      const lastSeenUpdates = {};
      users.forEach(user => {
        if (user.lastSeen) {
          lastSeenUpdates[user._id] = user.lastSeen;
        }
      });
      set({ users, userLastSeen: { ...get().userLastSeen, ...lastSeenUpdates } });
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
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
