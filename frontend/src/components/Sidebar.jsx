import { useEffect, useMemo, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Pin } from "lucide-react";
import PinButton from "./PinButton";
import ArchiveButton from "./ArchiveButton";

const Sidebar = () => {
  const {
    getUsers,
    users,
    pinnedChats,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    isChatArchived,
    isChatPinned,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [query, setQuery] = useState("");

  // Debounce query
  const debouncedQuery = useMemo(() => query, [query]);

  useEffect(() => {
    const id = setTimeout(() => {
      getUsers(debouncedQuery || undefined);
    }, 300);
    return () => clearTimeout(id);
  }, [getUsers, debouncedQuery]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  // Separate pinned , archived and unpinned , unarchived users

  //for archived users
  const archivedUsers = filteredUsers.filter((user) =>
    isChatArchived(user._id)
  );
  //for pinned users but not archived one
  const pinnedUsers = filteredUsers.filter(
    (user) => isChatPinned(user._id) && !isChatArchived(user._id)
  );
  //for users with not pinned and archived
  const unpinnedUsers = filteredUsers.filter(
    (user) => !isChatPinned(user._id) && !isChatArchived(user._id)
  );

  // Combine with pinned users first
  const sortedUsers = [...pinnedUsers, ...unpinnedUsers];

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>
      <div className="border-b border-base-300 w-full p-3 hidden lg:block">
        <input
          type="text"
          placeholder="Search by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input input-sm input-bordered w-full"
        />
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* Pinned Chats Section */}
        {pinnedUsers.length > 0 && (
          <div className="mb-4">
            <div className="px-3 mb-2 flex items-center gap-2 text-xs font-medium text-base-content/70 uppercase tracking-wider">
              <Pin className="size-3" />
              <span className="hidden lg:inline">Pinned</span>
            </div>
            {pinnedUsers.map((user) => (
              <div
                key={`pinned-${user._id}`}
                className={`
                  w-full p-3 flex items-center gap-3 group relative
                  hover:bg-base-300 transition-colors
                  ${
                    selectedUser?._id === user._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }
                `}
              >
                <button
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span
                        className="absolute bottom-0 right-0 size-3 bg-green-500 
                        rounded-full ring-2 ring-zinc-900"
                      />
                    )}
                  </div>

                  {/* User info - only visible on larger screens */}
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>

                {/* Pin button - visible on hover */}
                <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
                  <PinButton userId={user._id} />
                </div>
                {/* Archive / Unarchive button - visible on hover */}
                <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <ArchiveButton
                    userId={user._id}
                    isArchived={isChatArchived(user._id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Archived Chats Section */}
        {archivedUsers.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="px-3 mb-2 flex items-center gap-2 text-xs font-medium text-base-content/70 uppercase tracking-wider w-full text-left"
            >
              <Pin className="size-3" />
              <span className="hidden lg:inline">Archived Chats</span>
              <span className="ml-auto">{showArchived ? "▲" : "▼"}</span>
            </button>

            {showArchived &&
              archivedUsers.map((user) => (
                <div
                  key={`archived-${user._id}`}
                  className={`w-full p-3 flex items-center gap-3 group relative hover:bg-base-300 transition-colors
                  ${
                    selectedUser?._id === user._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="relative mx-auto lg:mx-0">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.name}
                        className="size-12 object-cover rounded-full"
                      />
                    </div>

                    <div className="hidden lg:block text-left min-w-0">
                      <div className="font-medium truncate">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-zinc-400">
                        Archived {isChatPinned(user._id) && "• Pinned"}
                      </div>
                    </div>
                  </button>

                  <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <ArchiveButton userId={user._id} isArchived={true} />
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Regular Chats Section */}
        {unpinnedUsers.length > 0 && pinnedUsers.length > 0 && (
          <div className="px-3 mb-2 text-xs font-medium text-base-content/70 uppercase tracking-wider">
            <span className="hidden lg:inline">All Chats</span>
          </div>
        )}

        {unpinnedUsers.map((user) => (
          <div
            key={user._id}
            className={`
              w-full p-3 flex items-center gap-3 group relative
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <button
              onClick={() => setSelectedUser(user)}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>

            {/* Pin button - visible on hover */}
            <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
              <PinButton userId={user._id} />
            </div>
            <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              <ArchiveButton
                userId={user._id}
                isArchived={isChatArchived(user._id)}
              />
            </div>
          </div>
        ))}

        {sortedUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
