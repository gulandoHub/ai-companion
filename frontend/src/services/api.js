import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await axios.post(`${API_URL}/auth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

export const chat = {
  createConversation: async () => {
    const response = await api.post('/chat/conversations');
    return response.data;
  },
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/${conversationId}/messages`);
    return response.data;
  },
  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/chat/${conversationId}/messages`, { content });
    return response.data;
  },
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  },
  startFineTuning: async () => {
    const response = await api.post('/fine-tune');
    return response.data;
  },
  updateConversationName: async (conversationId, name) => {
    const response = await api.patch(`/chat/conversations/${conversationId}/name`, { name: name });
    return response.data;
  },
};

export default api;
