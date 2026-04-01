import jwt from 'jsonwebtoken';
import { User, Conversation } from '../models/index.js';

/**
 * Socket.io connection handler
 * Manages real-time connections, authentication, and events
 */
export const initializeSocket = (io) => {
  // Store connected users (userId -> socketId mapping)
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    /**
     * Authenticate user
     * Client emits 'authenticate' with token after connection
     */
    socket.on('authenticate', async (token) => {
      try {
        if (!token) {
          socket.emit('auth_error', { message: 'No token provided' });
          return;
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
          socket.emit('auth_error', { message: 'User not found' });
          return;
        }

        // Store user info in socket
        socket.userId = user._id.toString();
        socket.user = user;

        // Add to connected users
        connectedUsers.set(user._id.toString(), socket.id);

        // Join user's personal room for private notifications
        socket.join(`user:${user._id}`);

        console.log(`User authenticated: ${user.name} (${user._id})`);
        socket.emit('authenticated', {
          success: true,
          user: {
            id: user._id,
            name: user.name,
            role: user.role,
          },
        });

        // Notify friends/connections that user is online (optional)
        socket.broadcast.emit('user_online', {
          userId: user._id.toString(),
          name: user.name,
        });
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        socket.emit('auth_error', { message: 'Invalid token' });
      }
    });

    /**
     * Join conversation room
     * Client emits 'join_conversation' when opening a chat
     */
    socket.on('join_conversation', async (conversationId) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Verify user is part of this conversation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (!conversation.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Leave previous conversation rooms
        socket.rooms.forEach((room) => {
          if (room.startsWith('conversation:')) {
            socket.leave(room);
          }
        });

        // Join new conversation room
        const roomName = `conversation:${conversationId}`;
        socket.join(roomName);
        socket.currentConversation = conversationId;

        console.log(`User ${socket.userId} joined conversation: ${conversationId}`);
        socket.emit('joined_conversation', { conversationId });

        // Mark messages as read
        await conversation.markAsRead(socket.userId);

        // Notify other participant
        socket.to(roomName).emit('user_typing', {
          userId: socket.userId,
          isTyping: false,
        });
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    /**
     * Leave conversation room
     */
    socket.on('leave_conversation', (conversationId) => {
      const roomName = `conversation:${conversationId}`;
      socket.leave(roomName);
      socket.currentConversation = null;
      console.log(`User ${socket.userId} left conversation: ${conversationId}`);
      socket.emit('left_conversation', { conversationId });
    });

    /**
     * Send message
     * Client emits 'send_message' when user sends a message
     */
    socket.on('send_message', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { conversationId, content, messageType = 'text', fileUrl, fileName, replyTo } = data;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Add message to conversation
        const message = await conversation.addMessage({
          sender: socket.userId,
          senderName: socket.user.name,
          content,
          messageType,
          fileUrl,
          fileName,
          replyTo,
        });

        // Broadcast message to all participants in the conversation
        const roomName = `conversation:${conversationId}`;
        io.to(roomName).emit('new_message', {
          conversationId,
          message,
        });

        // Send notification to offline participants
        conversation.participants.forEach((participantId) => {
          const participantSocketId = connectedUsers.get(participantId.toString());
          const isInConversation = participantSocketId &&
            io.sockets.sockets.get(participantSocketId)?.currentConversation === conversationId;

          if (participantId.toString() !== socket.userId && !isInConversation) {
            // Send notification
            io.to(`user:${participantId}`).emit('notification', {
              type: 'new_message',
              title: `New message from ${socket.user.name}`,
              message: content.substring(0, 100),
              conversationId,
            });
          }
        });

        console.log(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Typing indicator
     */
    socket.on('typing', (data) => {
      if (!socket.userId || !socket.currentConversation) return;

      const roomName = `conversation:${socket.currentConversation}`;
      socket.to(roomName).emit('user_typing', {
        userId: socket.userId,
        name: socket.user?.name,
        isTyping: data.isTyping,
      });
    });

    /**
     * Mark messages as read
     */
    socket.on('mark_read', async (conversationId) => {
      try {
        if (!socket.userId) return;

        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          await conversation.markAsRead(socket.userId);

          // Notify sender that messages were read
          socket.to(`conversation:${conversationId}`).emit('messages_read', {
            conversationId,
            readBy: socket.userId,
          });
        }
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      if (socket.userId) {
        // Remove from connected users
        connectedUsers.delete(socket.userId);

        // Notify others that user is offline
        socket.broadcast.emit('user_offline', {
          userId: socket.userId,
        });

        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });

  // Make connected users available globally
  global.connectedUsers = connectedUsers;
  global.io = io;

  return io;
};

/**
 * Helper function to emit event to specific user
 */
export const emitToUser = (userId, event, data) => {
  if (global.io) {
    global.io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Helper function to emit event to conversation
 */
export const emitToConversation = (conversationId, event, data) => {
  if (global.io) {
    global.io.to(`conversation:${conversationId}`).emit(event, data);
  }
};

export default {
  initializeSocket,
  emitToUser,
  emitToConversation,
};
