import {create} from "zustand"
import toast from "react-hot-toast"
import {axiosInstance} from "../lib/axios";
import {useAuthStore} from './useAuthStore'
import {useEncryptionStore} from './useEncryptionStore'

export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({isUsersLoading: true});
        try{
            const res = await axiosInstance.get("/messages/users");
            set({users: res.data});
        } catch(error){
            toast.error(error.response.data.message);
        } finally {
            set({isUsersLoading: false});
        }
    },

    getMessages: async(userId) => {
        set({isMessagesLoading: true});
        try{
            const res = await axiosInstance.get(`/messages/${userId}`);
            const messages = res.data;
            
            // Decrypt encrypted messages
            const decryptedMessages = await Promise.all(
                messages.map(async (message) => {
                    if (message.isEncrypted && message.encryptedText) {
                        try {
                            const decryptedText = await useEncryptionStore.getState().decryptReceivedMessage(
                                message.encryptedText,
                                message.senderId
                            );
                            return { ...message, text: decryptedText };
                        } catch (error) {
                            console.error("Failed to decrypt message:", error);
                            return { ...message, text: "[Encrypted message - unable to decrypt]" };
                        }
                    }
                    return message;
                })
            );
            
            set({messages: decryptedMessages});
        } catch(error){
            toast.error(error.response.data.message);

        } finally{
            set({isMessagesLoading: false});
        }
    },

    sendMessage: async(messageData) =>{
        const {selectedUser,messages} = get()
        try{
            // Encrypt message if text is provided
            let finalMessageData = { ...messageData };
            
            if (messageData.text) {
                const encryptionResult = await useEncryptionStore.getState().encryptMessageForSending(
                    messageData.text, 
                    selectedUser._id
                );
                finalMessageData = { ...messageData, ...encryptionResult };
            }
            
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, finalMessageData);
            set({messages:[...messages,res.data]})
        } catch(error){
            toast.error(error.response.data.messages);
        }
    },

    subscribeToMessages: () => {
        const {selectedUser} = get()
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        
        socket.on("newMessage", async (newMessage) => {
            if(newMessage.senderId !== selectedUser._id) return;
            
            // Decrypt message if it's encrypted
            if (newMessage.isEncrypted && newMessage.encryptedText) {
                try {
                    const decryptedText = await useEncryptionStore.getState().decryptReceivedMessage(
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
                messages: [...get().messages, newMessage]
            })
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({selectedUser}),
    
}));