import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const GroupChatContainer = ({ showSidebar, setShowSidebar }) => {
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
    removeGroupMembers,
    leaveGroup,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [activeTab, setActiveTab] = useState("add");
  const [memberIds, setMemberIds] = useState(
    new Set(selectedGroup.members.map((m) => m._id))
  );

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

  const handleAddMembers = async (userId) => {
    try {
      if (!userId) {
        alert("Please select the user.");
        return;
      }
      const data = await addGroupMembers(selectedGroup._id, userId);
      setMemberIds(new Set(data.members.map((m) => m)));
      alert("Members added successfully!");
    } catch (error) {
      console.error("Error adding members:", error);
      alert("Failed to add members");
    }
  };

  const handleRemoveMembers = async (userId) => {
    try {
      if (!userId) {
        alert("Please select the user.");
        return;
      }
      const data = await removeGroupMembers(selectedGroup._id, userId);
      setMemberIds(new Set(data.members.map((m) => m)));
      alert("Members removed successfully!");
    } catch (error) {
      console.error("Error adding members:", error);
      alert("Failed to add members");
    }
  };
  const nonMembers = users.filter((user) => !memberIds.has(user._id));
  const memberUsers = users.filter(
    (user) => !nonMembers.some((non) => non._id === user._id)
  );

  const isAdmin = authUser?._id === selectedGroup?.admin;

  if (isGroupMessagesLoading || isUsersLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader
          isGroup
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        <MessageSkeleton />
        <MessageInput isGroup />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader
        isGroup
        groupName={selectedGroup?.name}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />

      {isAdmin ? (
        <div className="flex items-center justify-end gap-2 mt-3">
          <button
            onClick={() => setShowManageMembers(true)}
            className="px-3 py-1.5 rounded-md btn btn-outline border bg-base-100 border-gray-300 hover:bg-base-300 text-sm font-medium"
          >
            Manage Members
          </button>
        </div>
      ) : (
        <button
          onClick={() => leaveGroup(selectedGroup._id)}
          className="px-3 py-1.5 rounded-md btn btn-outline border text-red-400 bg-base-100 border-gray-300 hover:bg-base-300 text-sm font-medium"
        >
          Leave Group
        </button>
      )}

      {showManageMembers && (
        <div className="fixed inset-0 flex items-center justify-center bg-base-300 z-50">
          <div className="bg-base-100 p-5 rounded-2xl shadow-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-3">Manage Members</h2>

            <div className="flex gap-2 mb-4 border-b pb-2">
              <button
                className={`flex-1 py-1 text-sm font-medium border-b-2 ${
                  activeTab === "add"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveTab("add")}
              >
                Add
              </button>
              <button
                className={`flex-1 py-1 text-sm font-medium border-b-2 ${
                  activeTab === "remove"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveTab("remove")}
              >
                Remove
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto flex flex-col gap-2">
              {activeTab === "add" ? (
                nonMembers.length > 0 ? (
                  nonMembers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between py-1 px-2 hover:bg-base-300 rounded-md"
                    >
                      <span>{user.fullName}</span>
                      <button
                        onClick={() => handleAddMembers(user._id)}
                        className="text-blue-600 text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  ))
                ) : (
                  <div>All contacts are added</div>
                )
              ) : (
                memberUsers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between py-1 px-2 hover:bg-base-300 rounded-md"
                  >
                    <span>{member.fullName}</span>
                    <button
                      onClick={() => handleRemoveMembers(member._id)}
                      className="text-red-600 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowManageMembers(false)}
              className="w-full py-1.5 rounded-md btn btn-outline bg-base-100 hover:bg-base-300 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default GroupChatContainer;
