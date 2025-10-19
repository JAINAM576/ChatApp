import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState, useMemo } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDate, shouldShowDateSeparator } from "../lib/utils";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

const MessageActions = ({ message, onEdit, onDelete }) => {
  const isWithinWindow = useMemo(() => {
    const twoMinutesMs = 2 * 60 * 1000;
    return Date.now() - new Date(message.createdAt).getTime() <= twoMinutesMs;
  }, [message.createdAt]);

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.text || "");

  if (!isWithinWindow) return null;

  const saveEdit = async () => {
    const trimmed = (draft || "").trim();
    if (!trimmed) return;
    await onEdit(message._id, trimmed);
    setIsEditing(false);
    setOpen(false);
  };

  const doDelete = async () => {
    await onDelete(message._id);
    setOpen(false);
  };

  return (
    <div className="mt-1">
      {!isEditing && (
        <div className="flex gap-1 self-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="btn btn-ghost btn-circle btn-xs"
            onClick={() => {
              setIsEditing(true);
              setDraft(message.text || "");
              setOpen(false);
            }}
            title="Edit"
          >
            <Pencil size={14}  className="sm:w-[14px] sm:h-[14px]" />
          </button>
          <button
            className="btn btn-ghost btn-circle btn-xs text-red-500"
            onClick={doDelete}
            title="Delete"
          >
            <Trash2 size={14} className="sm:w-[14px] sm:h-[14px]"  />
          </button>
        </div>
      )}

      {/* RESPONSIVE: Edit input with mobile-friendly sizing */}
      {isEditing && (
        <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-base-200 p-2 rounded">
          <input
            className="input input-xs sm:input-sm input-bordered w-full sm:w-48"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <button className="btn btn-xs btn-primary flex-1 sm:flex-none" onClick={saveEdit}>
            Save
          </button>
          <button
            className="btn btn-xs flex-1 sm:flex-none"
            onClick={() => {
              setIsEditing(false);
              setDraft(message.text || "");
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const ChatContainer = ({showSidebar,setShowSidebar}) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,
    deleteMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader  showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader  showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

      {/* RESPONSIVE: Messages container with mobile-friendly spacing */}


      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
          
          return (
            <div key={message._id}>
                     {/* RESPONSIVE: Date separator with mobile-friendly text size */}
              {showDateSeparator && (
                <div className="flex justify-center my-3 sm:my-4">
                  <div className="bg-base-200 text-base-content/70 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium">
                    {formatMessageDate(message.createdAt)}
                  </div>
                </div>
              )}
              <div
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
                ref={index === messages.length - 1 ? messageEndRef : null}
              >
                {/* RESPONSIVE: Avatar with mobile-friendly sizing */}
                <div className=" chat-image avatar">
                  <div className="size-8 sm:size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>
                    {/* RESPONSIVE: Timestamp with mobile-friendly text size */}
                <div className="chat-header mb-1">
                  <time className="text-[10px] sm:text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                  {/* RESPONSIVE: Chat bubble with mobile-friendly sizing */}
                <div className="chat-bubble flex flex-col relative group text-sm sm:text-base max-w-[85%] sm:max-w-none">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-[150px] sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                  {message.senderId === authUser._id && (
                    <MessageActions
                      message={message}
                      onEdit={editMessage}
                      onDelete={deleteMessage}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
