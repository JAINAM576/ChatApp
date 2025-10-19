import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { 
    generateSessionKey, 
    decryptSessionKey, 
    encryptMessage, 
    decryptMessage,
    importAESKey,
    exportAESKey
} from "../lib/encryption";
import toast from "../lib/toast";

export const useEncryptionStore = create((set, get) => ({
    isEncryptionEnabled: true,
    sessionKeys: {}, // userId -> CryptoKey
    encryptedSessionKeys: {}, // userId -> base64 encrypted session key
    userPublicKeys: {}, // userId -> PEM public key
    myPrivateKey: null,
    
    setEncryptionEnabled: (enabled) => set({ isEncryptionEnabled: enabled }),
    
    // Get user's public key
    getUserPublicKey: async (userId) => {
        const { userPublicKeys } = get();
        
        if (userPublicKeys[userId]) {
            return userPublicKeys[userId];
        }
        
        try {
            const res = await axiosInstance.get(`/messages/publickey/${userId}`);
            const publicKey = res.data.publicKey;
            
            set({
                userPublicKeys: {
                    ...userPublicKeys,
                    [userId]: publicKey
                }
            });
            
            return publicKey;
        } catch (error) {
            console.error("Failed to get user public key:", error);
            toast.error("Failed to get encryption key");
            return null;
        }
    },
    
    // Get my private key
    getMyPrivateKey: async () => {
        const { myPrivateKey } = get();
        
        if (myPrivateKey) {
            return myPrivateKey;
        }
        
        try {
            const res = await axiosInstance.get("/messages/privatekey/me");
            const privateKey = res.data.privateKey;
            
            set({ myPrivateKey: privateKey });
            return privateKey;
        } catch (error) {
            console.error("Failed to get private key:", error);
            toast.error("Failed to get decryption key");
            return null;
        }
    },
    
    // Initialize session key for a user
    initializeSessionKey: async (userId) => {
        const { sessionKeys, encryptedSessionKeys } = get();
        
        if (sessionKeys[userId]) {
            return sessionKeys[userId];
        }
        
        try {
            const publicKey = await get().getUserPublicKey(userId);
            if (!publicKey) {
                throw new Error("Could not get user's public key");
            }
            
            const { sessionKey, encryptedSessionKey } = await generateSessionKey(publicKey);
            
            set({
                sessionKeys: {
                    ...sessionKeys,
                    [userId]: sessionKey
                },
                encryptedSessionKeys: {
                    ...encryptedSessionKeys,
                    [userId]: encryptedSessionKey
                }
            });
            
            return sessionKey;
        } catch (error) {
            console.error("Failed to initialize session key:", error);
            toast.error("Failed to initialize encryption");
            return null;
        }
    },
    
    // Decrypt session key from incoming message
    decryptIncomingSessionKey: async (encryptedSessionKeyBase64) => {
        try {
            const privateKey = await get().getMyPrivateKey();
            if (!privateKey) {
                throw new Error("Could not get private key");
            }
            
            return await decryptSessionKey(encryptedSessionKeyBase64, privateKey);
        } catch (error) {
            console.error("Failed to decrypt session key:", error);
            return null;
        }
    },
    
    // Encrypt message for sending
    encryptMessageForSending: async (message, userId) => {
        const { isEncryptionEnabled } = get();
        
        if (!isEncryptionEnabled) {
            return { text: message, isEncrypted: false };
        }
        
        try {
            const sessionKey = await get().initializeSessionKey(userId);
            if (!sessionKey) {
                throw new Error("Could not initialize session key");
            }
            
            const encryptedData = await encryptMessage(message, sessionKey);
            const { encryptedSessionKeys } = get();
            
            return {
                encryptedText: {
                    ...encryptedData,
                    encryptedSessionKey: encryptedSessionKeys[userId]
                },
                isEncrypted: true
            };
        } catch (error) {
            console.error("Failed to encrypt message:", error);
            toast.error("Failed to encrypt message, sending as plain text");
            return { text: message, isEncrypted: false };
        }
    },
    
    // Decrypt received message
    decryptReceivedMessage: async (encryptedData, senderId) => {
        try {
            const { sessionKeys } = get();
            let sessionKey = sessionKeys[senderId];
            
            // If we don't have the session key, try to decrypt it
            if (!sessionKey && encryptedData.encryptedSessionKey) {
                sessionKey = await get().decryptIncomingSessionKey(encryptedData.encryptedSessionKey);
                if (sessionKey) {
                    set({
                        sessionKeys: {
                            ...sessionKeys,
                            [senderId]: sessionKey
                        }
                    });
                }
            }
            
            if (!sessionKey) {
                throw new Error("No session key available");
            }
            
            return await decryptMessage(encryptedData, sessionKey);
        } catch (error) {
            console.error("Failed to decrypt message:", error);
            return "[Encrypted message - unable to decrypt]";
        }
    },
    
    // Clear encryption data (for logout)
    clearEncryptionData: () => set({
        sessionKeys: {},
        encryptedSessionKeys: {},
        userPublicKeys: {},
        myPrivateKey: null
    })
}));