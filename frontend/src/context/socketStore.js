import { create } from 'zustand';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocketStore = create((set, get) => ({
  // State
  socket: null,
  isConnected: false,
  isAuthenticated: false,
  currentConversation: null,
  typingUsers: new Map(),
  onlineUsers: new Set(),

  // Actions
  connect: () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
      
      // Authenticate socket
      socket.emit('authenticate', token);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false, isAuthenticated: false });
    });

    socket.on('authenticated', (data) => {
      if (data.success) {
        set({ isAuthenticated: true });
        console.log('Socket authenticated');
      }
    });

    socket.on('auth_error', (error) => {
      console.error('Socket auth error:', error);
      set({ isAuthenticated: false });
    });

    socket.on('new_message', (data) => {
      const { currentConversation } = get();
      
      // If not in the conversation, show notification
      if (currentConversation !== data.conversationId) {
        // Play notification sound (optional)
        // new Audio('/notification.mp3').play().catch(() => {});
      }
    });

    socket.on('user_typing', (data) => {
      const { typingUsers } = get();
      const newTypingUsers = new Map(typingUsers);
      
      if (data.isTyping) {
        newTypingUsers.set(data.userId, data.name);
      } else {
        newTypingUsers.delete(data.userId);
      }
      
      set({ typingUsers: newTypingUsers });
    });

    socket.on('messages_read', (data) => {
      // Handle messages read event
      console.log('Messages read by:', data.readBy);
    });

    socket.on('user_online', (data) => {
      const { onlineUsers } = get();
      const newOnlineUsers = new Set(onlineUsers);
      newOnlineUsers.add(data.userId);
      set({ onlineUsers: newOnlineUsers });
    });

    socket.on('user_offline', (data) => {
      const { onlineUsers } = get();
      const newOnlineUsers = new Set(onlineUsers);
      newOnlineUsers.delete(data.userId);
      set({ onlineUsers: newOnlineUsers });
    });

    socket.on('notification', (data) => {
      toast(data.message, {
        icon: '🔔',
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error');
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        isAuthenticated: false,
        currentConversation: null,
        typingUsers: new Map(),
      });
    }
  },

  joinConversation: (conversationId) => {
    const { socket, isAuthenticated } = get();
    if (socket && isAuthenticated && conversationId) {
      socket.emit('join_conversation', conversationId);
      set({ currentConversation: conversationId });
    }
  },

  leaveConversation: (conversationId) => {
    const { socket, isAuthenticated } = get();
    if (socket && isAuthenticated && conversationId) {
      socket.emit('leave_conversation', conversationId);
      set({ currentConversation: null });
    }
  },

  sendMessage: (conversationId, messageData) => {
    const { socket, isAuthenticated } = get();
    if (socket && isAuthenticated) {
      socket.emit('send_message', {
        conversationId,
        ...messageData,
      });
    }
  },

  setTyping: (isTyping) => {
    const { socket, isAuthenticated, currentConversation } = get();
    if (socket && isAuthenticated && currentConversation) {
      socket.emit('typing', { isTyping });
    }
  },

  markAsRead: (conversationId) => {
    const { socket, isAuthenticated } = get();
    if (socket && isAuthenticated) {
      socket.emit('mark_read', conversationId);
    }
  },
}));

export default useSocketStore;
