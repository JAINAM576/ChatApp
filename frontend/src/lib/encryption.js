// Frontend encryption utilities using Web Crypto API

/**
 * Generate AES-GCM key for message encryption
 * @returns {Promise<CryptoKey>} Generated AES key
 */
export async function generateAESKey() {
    return await window.crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true, // extractable
        ['encrypt', 'decrypt']
    );
}

/**
 * Export AES key to raw format
 * @param {CryptoKey} key - AES key to export
 * @returns {Promise<ArrayBuffer>} Raw key data
 */
export async function exportAESKey(key) {
    return await window.crypto.subtle.exportKey('raw', key);
}

/**
 * Import AES key from raw format
 * @param {ArrayBuffer} keyData - Raw key data
 * @returns {Promise<CryptoKey>} Imported AES key
 */
export async function importAESKey(keyData) {
    return await window.crypto.subtle.importKey(
        'raw',
        keyData,
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt message using AES-GCM
 * @param {string} message - Message to encrypt
 * @param {CryptoKey} key - AES key for encryption
 * @returns {Promise<object>} Encrypted data with iv and encrypted content
 */
export async function encryptMessage(message, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        data
    );
    
    return {
        encrypted: arrayBufferToBase64(encrypted),
        iv: arrayBufferToBase64(iv),
    };
}

/**
 * Decrypt message using AES-GCM
 * @param {object} encryptedData - Object containing encrypted data and iv
 * @param {CryptoKey} key - AES key for decryption
 * @returns {Promise<string>} Decrypted message
 */
export async function decryptMessage(encryptedData, key) {
    const { encrypted, iv } = encryptedData;
    
    const encryptedBuffer = base64ToArrayBuffer(encrypted);
    const ivBuffer = base64ToArrayBuffer(iv);
    
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: ivBuffer,
        },
        key,
        encryptedBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

/**
 * Import RSA public key from PEM format
 * @param {string} pemKey - PEM formatted public key
 * @returns {Promise<CryptoKey>} Imported public key
 */
export async function importRSAPublicKey(pemKey) {
    // Remove PEM headers and decode base64
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pemKey.substring(pemHeader.length, pemKey.length - pemFooter.length);
    const binaryDerString = window.atob(pemContents.replace(/\s/g, ''));
    const binaryDer = str2ab(binaryDerString);
    
    return await window.crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        true,
        ['encrypt']
    );
}

/**
 * Import RSA private key from PEM format
 * @param {string} pemKey - PEM formatted private key
 * @returns {Promise<CryptoKey>} Imported private key
 */
export async function importRSAPrivateKey(pemKey) {
    // Remove PEM headers and decode base64
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = pemKey.substring(pemHeader.length, pemKey.length - pemFooter.length);
    const binaryDerString = window.atob(pemContents.replace(/\s/g, ''));
    const binaryDer = str2ab(binaryDerString);
    
    return await window.crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        true,
        ['decrypt']
    );
}

/**
 * Encrypt data using RSA public key
 * @param {ArrayBuffer} data - Data to encrypt
 * @param {CryptoKey} publicKey - RSA public key
 * @returns {Promise<ArrayBuffer>} Encrypted data
 */
export async function encryptWithRSA(data, publicKey) {
    return await window.crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        publicKey,
        data
    );
}

/**
 * Decrypt data using RSA private key
 * @param {ArrayBuffer} encryptedData - Encrypted data
 * @param {CryptoKey} privateKey - RSA private key
 * @returns {Promise<ArrayBuffer>} Decrypted data
 */
export async function decryptWithRSA(encryptedData, privateKey) {
    return await window.crypto.subtle.decrypt(
        {
            name: 'RSA-OAEP',
        },
        privateKey,
        encryptedData
    );
}

// Utility functions
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

/**
 * Generate a session key for a conversation and encrypt it with recipient's public key
 * @param {string} recipientPublicKeyPem - Recipient's RSA public key in PEM format
 * @returns {Promise<object>} Session key and encrypted session key
 */
export async function generateSessionKey(recipientPublicKeyPem) {
    // Generate AES session key
    const sessionKey = await generateAESKey();
    const sessionKeyRaw = await exportAESKey(sessionKey);
    
    // Import recipient's public key
    const recipientPublicKey = await importRSAPublicKey(recipientPublicKeyPem);
    
    // Encrypt session key with recipient's public key
    const encryptedSessionKey = await encryptWithRSA(sessionKeyRaw, recipientPublicKey);
    
    return {
        sessionKey,
        encryptedSessionKey: arrayBufferToBase64(encryptedSessionKey)
    };
}

/**
 * Decrypt session key using private key
 * @param {string} encryptedSessionKeyBase64 - Base64 encoded encrypted session key
 * @param {string} privateKeyPem - RSA private key in PEM format
 * @returns {Promise<CryptoKey>} Decrypted AES session key
 */
export async function decryptSessionKey(encryptedSessionKeyBase64, privateKeyPem) {
    const privateKey = await importRSAPrivateKey(privateKeyPem);
    const encryptedSessionKey = base64ToArrayBuffer(encryptedSessionKeyBase64);
    
    const sessionKeyRaw = await decryptWithRSA(encryptedSessionKey, privateKey);
    return await importAESKey(sessionKeyRaw);
}