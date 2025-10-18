import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const GroupChatContainer = () => {
  const {
    users,
    isUsersLoading,
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    selectedGroup,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    addGroupMembers,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!selectedGroup?._id) return;
    getGroupMessages(selectedGroup._id);
    subscribeToGroupMessages(selectedGroup._id);
    return () => {
      unsubscribeFromGroupMessages(selectedGroup._id);
    };
  }, [selectedGroup?._id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    try {
      if (selectedUserIds.length === 0) {
        alert("Please select at least one user.");
        return;
      }

      setIsAdding(true);
      await addGroupMembers(selectedGroup._id, selectedUserIds);
      alert("Members added successfully!");
      setShowAddMembers(false);
      setSelectedUserIds([]);
    } catch (error) {
      console.error("Error adding members:", error);
      alert("Failed to add members");
    } finally {
      setIsAdding(false);
    }
  };

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader isGroup />
        <MessageSkeleton />
        <MessageInput isGroup />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader isGroup groupName={selectedGroup?.name} />
      {/* 🆕 Add Members Button */}
      <button
        onClick={() => setShowAddMembers(true)}
        className="btn btn-sm btn-outline"
      >
        Add Members
      </button>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessages.map((msg) => (
          <div
            key={msg._id}
            className={`chat ${
              msg.senderId._id === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={msg.senderId.profilePic || "/avatar.png"}
                  alt="user"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <span className="font-semibold">{msg.senderId.fullName}</span>
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(msg.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {msg.text && <p>{msg.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput isGroup />
      {/* 🆕 Add Members Modal */}
      {/* 🆕 Add Members Modal */}
      {showAddMembers && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-[420px] max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold mb-3">Add Members</h3>

            {isUsersLoading ? (
              <p className="text-center">Loading users...</p>
            ) : (
              <div className="overflow-y-auto flex-1 mb-3 space-y-2">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center">
                    No users found.
                  </p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user._id}
                      className="flex justify-between items-center border rounded-md p-2"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt="user"
                          className="w-8 h-8 rounded-full border"
                        />
                        <span>{user.fullName}</span>
                      </div>
                      <button
                        className={`btn btn-xs ${
                          selectedUserIds.includes(user._id)
                            ? "btn-error"
                            : "btn-success"
                        }`}
                        onClick={() => toggleUserSelection(user._id)}
                      >
                        {selectedUserIds.includes(user._id) ? "–" : "+"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowAddMembers(false)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMembers}
                disabled={isAdding}
                className="btn btn-sm btn-primary"
              >
                {isAdding ? "Adding..." : "Add Selected"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatContainer;
