# URL-Based Routing Implementation

This document describes the URL-based routing functionality implemented in the chat interface.

## Overview

The chat interface now supports URL-based routing where each conversation has its own URL. This allows users to:
- Bookmark specific conversations
- Share conversation URLs
- Navigate directly to conversations via URL
- Refresh the page and maintain the current conversation

## URL Structure

- **Root URL**: `http://localhost:5173/` - Redirects to the first conversation
- **Conversation URL**: `http://localhost:5173/{conversationId}` - Direct access to a specific conversation

## Features

### 1. URL-Based Navigation
- When you visit a URL like `http://localhost:5173/240`, the app will load conversation with ID 240
- If the conversation doesn't exist, you'll be redirected to the first available conversation
- Invalid conversation IDs (non-numeric) will also redirect to the first conversation

### 2. New Chat Creation
- Clicking "New Chat" creates a new conversation and navigates to its URL
- The URL will update to show the new conversation ID (e.g., `http://localhost:5173/241`)

### 3. Conversation Selection
- Clicking on a conversation in the sidebar navigates to its URL
- The URL updates to reflect the selected conversation

### 4. Conversation Deletion
- When deleting the current conversation, you'll be redirected to the first remaining conversation
- If no conversations remain, you'll be redirected to the root URL

### 5. Page Refresh
- Refreshing the page maintains the current conversation
- The conversation ID is preserved in the URL

## Implementation Details

### Key Components

1. **useParams Hook**: Extracts conversation ID from URL
2. **useNavigate Hook**: Programmatically navigates to different URLs
3. **URL Processing Effect**: Handles URL-based conversation loading
4. **Navigation Functions**: Update URLs when creating/selecting/deleting conversations

### State Management

- `urlConversationId`: Extracted from URL parameters
- `currentConversation`: Currently active conversation
- `conversations`: List of all available conversations

### Error Handling

- Invalid conversation IDs redirect to first conversation
- Non-existent conversations redirect to first conversation
- Empty conversation lists show loading state

## Usage Examples

1. **Direct Navigation**: Visit `http://localhost:5173/240` to load conversation 240
2. **New Chat**: Click "New Chat" → URL updates to new conversation ID
3. **Sidebar Selection**: Click conversation in sidebar → URL updates
4. **Refresh**: Refresh page → Same conversation loads
5. **Bookmark**: Bookmark any conversation URL for direct access

## Technical Notes

- Conversation IDs are parsed as integers from URL strings
- Navigation is handled programmatically using React Router
- URL updates happen synchronously with state changes
- Loading states prevent premature navigation
- Console logging provides debugging information for URL processing 