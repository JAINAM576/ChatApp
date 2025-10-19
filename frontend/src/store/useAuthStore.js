import {create} from "zustand"
import {axiosInstance} from '../lib/axios'
import toast from '../lib/toast'
import {io} from "socket.io-client"

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export const useAuthStore = create((set,get) =>({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    typingUsers: {},

    checkAuth: async() =>{
        try{
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data})
            get().connectSocket()
        } catch(error){
            set({authUser: null})
            console.log("Error in checkAuth: ",error)
        } finally{
            set({isCheckingAuth:false})
        }
    },

    // Helper to extract error message safely
    _getErrorMessage: (error, fallback = 'An error occurred') => {
        if (!error) return fallback;
        // Axios-like error
        if (error.response && error.response.data) {
            // Prefer structured message fields
            return error.response.data.message || error.response.data.error || JSON.stringify(error.response.data) || fallback;
        }
        // plain Error
        if (error.message) return error.message;
        return String(error);
    },

    signup: async(data) =>{
        set({isSigningUp: true});
        try{
            const res = await axiosInstance.post("/auth/signup",data);
            set({authUser: res.data});
            toast.success("Account created successfully");
            get().connectSocket()
            return res;
        } catch(error){
            console.log("Error in signup: ", error);
            // Rethrow and let caller (page) display the toast to avoid duplicate messages
            throw error;
        } finally{
            set({isSigningUp: false});
        }
    },

    login: async(data) =>{
        set({isLoggingIn: true});
        try{
            const res = await axiosInstance.post("/auth/login",data);
            set({authUser: res.data});
            toast.success("Logged in successfully")
            get().connectSocket()
        } catch(error){
            const msg = get()._getErrorMessage(error, 'Login failed');
            toast.error(msg);
        } finally {
            set({isLoggingIn: false});
        }
    },
    
    logout: async() =>{
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            toast.success("Logged out successfully");
            get().disconnectSocket();
            
            // Clear encryption data
                try {
                    const mod = await import('./useEncryptionStore');
                    // module exports `useEncryptionStore` (a zustand store). Clear via getState()
                    if (mod && mod.useEncryptionStore && typeof mod.useEncryptionStore.getState === 'function') {
                        const clearFn = mod.useEncryptionStore.getState().clearEncryptionData;
                        if (typeof clearFn === 'function') {
                            clearFn();
                        }
                    }
                } catch (err) {
                    // Non-fatal: log and continue
                    console.warn('Unable to clear encryption data on logout:', err);
                }
        } catch(error){
            const msg = get()._getErrorMessage(error, 'Logout failed');
            toast.error(msg);
        }
    },
    
    updateProfile: async(data) =>{
        set({isUpdatingProfile: true});
        try{
            const res = await axiosInstance.put("/auth/update-profile",data);
            set({authUser: res.data});
            toast.success("Profile updated successfully");
        } catch(error){
            const msg = get()._getErrorMessage(error, 'Failed to update profile');
            toast.error(msg);
        } finally{
            set({isUpdatingProfile: false});
        }
    },

    connectSocket: () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL,{
            query: {
                userId: authUser._id,
            },
            withCredentials: true,
        })
        socket.connect()
        set({socket:socket});
        socket.on("getOnlineUsers",(userIds) => {
            set({onlineUsers: userIds})
        })

        socket.on("userTyping", ({ userId }) => {
            set((state) => ({
                typingUsers: { ...state.typingUsers, [userId]: true }
            }));
        });

        socket.on("userStopTyping", ({ userId }) => {
            set((state) => {
                const newTypingUsers = { ...state.typingUsers };
                delete newTypingUsers[userId];
                return { typingUsers: newTypingUsers };
            });
        });

        // Global handlers: always listen for incoming messages so we can show
        // notifications even when a specific chat/group is not open.
        socket.on("newMessage", async (message) => {
            try {
                console.debug('[socket] newMessage received', message);
                // dynamic import to avoid circular dependency
                const mod = await import('./useChatStore');
                const chatStore = mod.useChatStore;
                const currentUser = get().authUser;
                if (!chatStore || !currentUser) return;

                // If the message is for the currently selected user, the per-chat
                // subscription already handles appending, but append here as a
                // safeguard so unread counts / lists stay in sync.
                const selectedUser = chatStore.getState().selectedUser;
                if (selectedUser && message.senderId === selectedUser._id) {
                    // append to messages for open chat
                    chatStore.setState((s) => ({ messages: [...s.messages, message] }));
                } else {
                    // not the open chat: append to top-level messages array
                    chatStore.setState((s) => ({ messages: [...s.messages, message] }));
                    // show notification (chat store will handle decrypting if needed)
                    if (message.senderId !== currentUser._id) {
                        chatStore.getState().notifyNewMessage(message, { isGroup: false });
                    }
                }
            } catch (err) {
                console.warn('global newMessage handler error', err);
            }
        });

        socket.on("newGroupMessage", async (message) => {
            try {
                console.debug('[socket] newGroupMessage received', message);
                const mod = await import('./useChatStore');
                const chatStore = mod.useChatStore;
                const currentUser = get().authUser;
                if (!chatStore || !currentUser) return;

                const selectedGroup = chatStore.getState().selectedGroup;
                // append to group messages list so history/unread works
                chatStore.setState((s) => ({ groupMessages: [...s.groupMessages, message] }));

                // notify when group not open
                if (!selectedGroup || message.groupId !== selectedGroup._id) {
                    if (message.senderId !== currentUser._id) {
                        chatStore.getState().notifyNewMessage(message, { isGroup: true });
                    }
                }
            } catch (err) {
                console.warn('global newGroupMessage handler error', err);
            }
        });
    },

    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    }, 
}))
