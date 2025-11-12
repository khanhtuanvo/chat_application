import axios from 'axios';
import { getAuthToken } from './authService'

const API_URL = 'http://localhost:8000/api/chat';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add authentication token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Send a message to the backend and get AI response
export const sendMessage = async (conversationId, message) => {
  try {
    const response = await api.post('/send', {
      conversation_id: conversationId,
      content: message,
      role: 'user'
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Send a message to the backend and stream AI response
// Update sendMessageStream to include auth headers
export const sendMessageStream = async (conversationId, message) => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch('http://localhost:8000/api/chat/send_stream', {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversation_id: conversationId, content: message, role: 'user' })
  });
  if (!response.ok) throw new Error('Streaming request failed');
  return response.body.getReader();
};

// Update the getConversations function to support exclude_ids
export const getConversations = async (page = 1, limit = 10, excludeIds = []) => {
  try {
    const params = {
      page: page,
      limit: limit
    };
    
    if (excludeIds.length > 0) {
      params.exclude_ids = excludeIds.join(',');
    }
    
    const response = await api.get('/conversations', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get all messages for a conversation
export const getMessages = async (conversationId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Create a new conversation
export const createConversation = async (title = 'New Chat') => {
  try {
    const response = await api.post('/conversations', { title });
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Update a conversation (rename)
export const updateConversation = async (conversationId, updates) => {
  try {
    const response = await api.put(`/conversations/${conversationId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

// Delete a conversation
export const deleteConversation = async (conversationId) => {
  try {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

// Generate automatic title for a conversation
export const generateConversationTitle = async (conversationId) => {
  try {
    const response = await api.post(`/conversations/${conversationId}/title`);
    return response.data;
  } catch (error) {
    console.error('Error when generate title', error);
    throw error;
  }
};

// Fetch a single conversation by ID
export const getConversation = async (conversationId) => {
  try {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};