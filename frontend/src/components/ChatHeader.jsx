import { X, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import EncryptionToggle from "./EncryptionToggle";
import PinButton from "./PinButton";
import { useEffect, useState } from "react";

const ChatHeader = ({ isGroup = false }) => {
  const { selectedUser, setSelectedUser, selectedGroup, setSelectedGroup,userLastSeen } =
    useChatStore();

   const { onlineUsers, typingUsers } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);

   useEffect(() => {
    setIsTyping(typingUsers[selectedUser?._id] || false);
  }, [typingUsers, selectedUser?._id]);

  const chatTarget = isGroup ? selectedGroup : selectedUser;
  if (!chatTarget) return null;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              {isGroup ? (
                <div className="bg-primary text-white flex items-center justify-center size-10 rounded-full text-lg font-semibold uppercase">
                  {chatTarget.name?.charAt(0) || "G"}
                </div>
              ) : (
                <img
                  src={chatTarget?.profilePic || "/avatar.png"}
                  alt={chatTarget?.fullName || chatTarget?.name || ""}
                />
              )}
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">
              {isGroup
                ? chatTarget.name
                : chatTarget.fullName || chatTarget.name || ""}
            </h3>
             <p className="text-sm text-base-content/70">
              {isTyping ? "Typing..." : onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
            </p>

            {isGroup ? (
              <p className="text-sm text-base-content/70 flex items-center gap-1">
                <Users className="w-4 h-4" /> {chatTarget.members?.length || 0}{" "}
                members
              </p>
            ) : (
              <p className="text-sm text-base-content/70">
                {/* {onlineUsers.includes(chatTarget._id) ? "Online" : "Offline"} */}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isGroup && <PinButton userId={chatTarget._id} />}
          <EncryptionToggle />

          {/* Close */}
          <button
            onClick={() =>
              isGroup ? setSelectedGroup(null) : setSelectedUser(null)
            }
          >
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
