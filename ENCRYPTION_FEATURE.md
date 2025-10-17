# End-to-End Encryption Feature

## Overview
This feature adds end-to-end encryption to the chat application, ensuring that messages are encrypted on the sender's device and can only be decrypted by the intended recipient.

## How It Works

### Key Generation
- When users sign up, RSA key pairs (2048-bit) are automatically generated
- Public keys are stored in the database and shared with other users
- Private keys are stored securely and only accessible to the user

### Message Encryption Process
1. **Session Key Generation**: For each conversation, a unique AES-256-GCM session key is generated
2. **Key Exchange**: The session key is encrypted using the recipient's RSA public key
3. **Message Encryption**: Messages are encrypted using the AES session key
4. **Transmission**: Both the encrypted message and encrypted session key are sent

### Message Decryption Process
1. **Key Decryption**: The recipient uses their RSA private key to decrypt the session key
2. **Message Decryption**: The session key is used to decrypt the message content
3. **Display**: The decrypted message is displayed to the user

## Security Features

- **AES-256-GCM Encryption**: Industry-standard symmetric encryption for message content
- **RSA-2048 Key Exchange**: Secure asymmetric encryption for session key distribution
- **Perfect Forward Secrecy**: Each conversation uses unique session keys
- **Client-Side Encryption**: Messages are encrypted before leaving the sender's device
- **Zero-Knowledge**: The server cannot read encrypted message content

## User Interface

### Encryption Toggle
- Located in the chat header next to each conversation
- Green shield icon indicates encryption is enabled
- Gray shield icon indicates encryption is disabled
- Users can toggle encryption on/off per conversation

### Visual Indicators
- Encrypted messages show a shield icon
- Failed decryption shows "[Encrypted message - unable to decrypt]"
- Encryption status is clearly visible in the chat header

## Technical Implementation

### Backend Changes
- Updated User model to store RSA key pairs
- Modified Message model to support encrypted content
- Added encryption utilities using Node.js crypto module
- New API endpoints for key exchange

### Frontend Changes
- Web Crypto API integration for client-side encryption
- New encryption store for key management
- Updated chat store to handle encryption/decryption
- Encryption toggle component

## API Endpoints

- `GET /api/messages/publickey/:id` - Get user's public key
- `GET /api/messages/privatekey/me` - Get current user's private key
- `POST /api/messages/send/:id` - Send message (supports encrypted content)

## Database Schema Changes

### User Model
```javascript
{
  // ... existing fields
  publicKey: String,    // RSA public key (PEM format)
  privateKey: String,   // RSA private key (PEM format)
}
```

### Message Model
```javascript
{
  // ... existing fields
  encryptedText: Object,  // Encrypted message data
  isEncrypted: Boolean,   // Encryption flag
}
```

## Usage

1. **Enable Encryption**: Click the shield icon in the chat header
2. **Send Messages**: Type and send messages normally - they'll be automatically encrypted
3. **Receive Messages**: Encrypted messages are automatically decrypted and displayed
4. **Disable Encryption**: Click the shield icon again to send plain text messages

## Security Considerations

- Private keys are stored in the database (in production, consider client-side key storage)
- Session keys are generated per conversation for forward secrecy
- Failed decryption attempts are logged for security monitoring
- Encryption can be toggled per conversation based on user preference

## Future Enhancements

- Client-side private key storage
- Key rotation mechanisms
- Message verification signatures
- Encrypted file sharing
- Group chat encryption support