# Pin a Chat Feature

## Overview
This feature allows users to pin important chats to the top of their sidebar for quick and easy access. Pinned chats are displayed in a separate "Pinned" section above regular chats.

## Features

### 🔧 Core Functionality
- **Pin/Unpin Chats**: Users can pin or unpin any chat conversation
- **Visual Organization**: Pinned chats appear in a dedicated section at the top
- **Persistent Storage**: Pin status is saved in the database per user
- **Easy Access**: Pin buttons available in both sidebar and chat header

### 🎨 User Interface
- **Pin Icons**: Filled pin icon for pinned chats, outline for unpinned
- **Hover Effects**: Pin buttons appear on hover in the sidebar
- **Section Headers**: Clear visual separation between pinned and regular chats
- **Responsive Design**: Works on both desktop and mobile layouts

### 📱 User Experience
- **Quick Pinning**: Click pin icon to instantly pin/unpin a chat
- **Visual Feedback**: Toast notifications confirm pin/unpin actions
- **Smart Sorting**: Pinned chats always appear first, regardless of recent activity
- **Intuitive Controls**: Pin buttons in both sidebar (on hover) and chat header

## How It Works

### Backend Implementation
1. **Database Schema**: Added `pinnedChats` array to User model
2. **API Endpoints**: Created endpoints for pin, unpin, and get pinned chats
3. **Data Management**: Stores user IDs of pinned conversations per user

### Frontend Implementation
1. **State Management**: Extended chat store with pinned chats functionality
2. **UI Components**: Created reusable PinButton component
3. **Smart Sorting**: Automatically sorts users with pinned chats first
4. **Visual Indicators**: Clear section headers and pin icons

## API Endpoints

### GET `/api/messages/pinned/chats`
- **Description**: Get all pinned chats for the current user
- **Response**: Array of user objects that are pinned
- **Authentication**: Required

### POST `/api/messages/pin/:id`
- **Description**: Pin a chat with the specified user
- **Parameters**: `id` - User ID to pin
- **Response**: Success message
- **Authentication**: Required

### POST `/api/messages/unpin/:id`
- **Description**: Unpin a chat with the specified user
- **Parameters**: `id` - User ID to unpin
- **Response**: Success message
- **Authentication**: Required

## Database Schema Changes

### User Model
```javascript
{
  // ... existing fields
  pinnedChats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
}
```

## Frontend Components

### PinButton Component
- **Props**: `userId`, `className`
- **Functionality**: Toggle pin/unpin state with visual feedback
- **Icons**: Uses Lucide React Pin/PinOff icons
- **Styling**: Adapts to current theme with hover effects

### Updated Sidebar
- **Pinned Section**: Dedicated section for pinned chats
- **Section Headers**: Clear visual separation
- **Hover Controls**: Pin buttons appear on hover
- **Smart Sorting**: Pinned chats always appear first

### Updated Chat Header
- **Pin Control**: Pin button next to encryption toggle
- **Quick Access**: Easy pinning from active conversation
- **Visual Consistency**: Matches overall header design

## Usage Instructions

### Pinning a Chat
1. **From Sidebar**: Hover over any chat and click the pin icon
2. **From Chat Header**: Open a conversation and click the pin icon in the header
3. **Visual Feedback**: Chat moves to "Pinned" section with success toast

### Unpinning a Chat
1. **From Sidebar**: Hover over a pinned chat and click the filled pin icon
2. **From Chat Header**: In a pinned conversation, click the pin icon in header
3. **Visual Feedback**: Chat moves back to regular section with success toast

### Visual Indicators
- **Filled Pin Icon**: Chat is currently pinned
- **Outline Pin Icon**: Chat is not pinned (hover to see)
- **Section Headers**: "Pinned" and "All Chats" sections clearly labeled
- **Positioning**: Pinned chats always appear at the top

## Technical Details

### State Management
- **Zustand Store**: Manages pinned chats state
- **Local Updates**: Optimistic UI updates for better UX
- **Server Sync**: Automatic synchronization with backend
- **Error Handling**: Graceful fallback on API failures

### Performance Considerations
- **Efficient Sorting**: Minimal re-renders when pinning/unpinning
- **Lazy Loading**: Pinned chats loaded with regular user list
- **Memory Efficient**: Reuses existing user objects
- **Responsive Updates**: Real-time UI updates without page refresh

### Error Handling
- **Network Errors**: Toast notifications for failed operations
- **Validation**: Prevents duplicate pins and invalid operations
- **Fallback UI**: Graceful degradation if features unavailable
- **User Feedback**: Clear error messages and success confirmations

## Future Enhancements

### Potential Improvements
- **Drag & Drop**: Reorder pinned chats by dragging
- **Pin Limits**: Optional maximum number of pinned chats
- **Bulk Operations**: Pin/unpin multiple chats at once
- **Keyboard Shortcuts**: Hotkeys for quick pinning
- **Export/Import**: Backup and restore pinned chat preferences

### Advanced Features
- **Smart Pinning**: Auto-pin frequently contacted users
- **Temporary Pins**: Auto-unpin after specified time
- **Group Pinning**: Pin entire chat groups or categories
- **Cross-Device Sync**: Maintain pin status across devices
- **Pin Analytics**: Track most pinned conversations

## Security Considerations

- **User Isolation**: Users can only pin their own chats
- **Data Validation**: Server-side validation of pin operations
- **Rate Limiting**: Prevent abuse of pin/unpin operations
- **Privacy**: Pin status is private to each user
- **Data Integrity**: Consistent state between client and server

## Browser Compatibility

- **Modern Browsers**: Full support in Chrome, Firefox, Safari, Edge
- **Mobile Responsive**: Works on iOS and Android browsers
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Touch Support**: Touch-friendly pin buttons on mobile devices

---

This feature significantly improves the user experience by allowing users to organize their most important conversations for quick access. The implementation is robust, user-friendly, and follows modern web development best practices.