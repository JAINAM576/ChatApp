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
            <Pencil size={14} />
          </button>
          <button
            className="btn btn-ghost btn-circle btn-xs text-red-500"
            onClick={doDelete}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {isEditing && (
        <div className="mt-2 flex items-center gap-2 bg-base-200 p-2 rounded">
          <input
            className="input input-xs input-bordered w-48"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <button className="btn btn-xs btn-primary" onClick={saveEdit}>
            Save
          </button>
          <button
            className="btn btn-xs"
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

const ChatContainer = () => {
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
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
          
          return (
            <div key={message._id}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <div className="bg-base-200 text-base-content/70 px-3 py-1 rounded-full text-xs font-medium">
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
                <div className=" chat-image avatar">
                  <div className="size-10 rounded-full border">
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
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col relative group">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
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
