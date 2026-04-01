import mongoose from 'mongoose';

/**
 * Message Schema (Embedded in Conversation)
 * Represents a single message in a conversation
 */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    // Read receipts
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // For deletion
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // Reply to message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Conversation Schema
 * Represents a chat conversation between two users about a specific ticket
 */
const conversationSchema = new mongoose.Schema(
  {
    // Participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Related ticket (optional - for ticket-specific conversations)
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
    ticketInfo: {
      title: String,
      image: String,
      price: Number,
    },
    // Messages
    messages: [messageSchema],
    // Last message for quick preview
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sentAt: Date,
    },
    // Conversation metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Unread counts per participant
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    // Typing indicators
    typingUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        startedAt: Date,
      },
    ],
    // Conversation type
    type: {
      type: String,
      enum: ['direct', 'ticket_inquiry', 'support'],
      default: 'direct',
    },
    // For support conversations
    supportTicketId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
conversationSchema.index({ participants: 1 });
conversationSchema.index({ ticket: 1 });
conversationSchema.index({ 'lastMessage.sentAt': -1 });
conversationSchema.index({ updatedAt: -1 });

/**
 * Add a new message to the conversation
 */
conversationSchema.methods.addMessage = async function (messageData) {
  const message = {
    sender: messageData.sender,
    senderName: messageData.senderName,
    content: messageData.content,
    messageType: messageData.messageType || 'text',
    fileUrl: messageData.fileUrl || null,
    fileName: messageData.fileName || null,
    replyTo: messageData.replyTo || null,
  };

  this.messages.push(message);

  // Update last message
  this.lastMessage = {
    content: messageData.content,
    sender: messageData.sender,
    sentAt: new Date(),
  };

  // Increment unread count for other participants
  this.participants.forEach((participantId) => {
    if (participantId.toString() !== messageData.sender.toString()) {
      const currentCount = this.unreadCount.get(participantId.toString()) || 0;
      this.unreadCount.set(participantId.toString(), currentCount + 1);
    }
  });

  await this.save();
  return this.messages[this.messages.length - 1];
};

/**
 * Mark messages as read for a user
 */
conversationSchema.methods.markAsRead = async function (userId) {
  // Update unread count
  this.unreadCount.set(userId.toString(), 0);

  // Mark all unread messages from other users as read
  let updated = false;
  this.messages.forEach((message) => {
    if (
      message.sender.toString() !== userId.toString() &&
      !message.isRead
    ) {
      message.isRead = true;
      message.readAt = new Date();
      updated = true;
    }
  });

  if (updated) {
    await this.save();
  }
  return updated;
};

/**
 * Get unread count for a specific user
 */
conversationSchema.methods.getUnreadCount = function (userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

/**
 * Set typing status for a user
 */
conversationSchema.methods.setTyping = async function (userId, isTyping) {
  if (isTyping) {
    // Remove existing entry if any
    this.typingUsers = this.typingUsers.filter(
      (t) => t.user.toString() !== userId.toString()
    );
    // Add new typing entry
    this.typingUsers.push({
      user: userId,
      startedAt: new Date(),
    });
  } else {
    this.typingUsers = this.typingUsers.filter(
      (t) => t.user.toString() !== userId.toString()
    );
  }
  await this.save();
};

/**
 * Block conversation
 */
conversationSchema.methods.block = async function (userId) {
  this.isBlocked = true;
  this.blockedBy = userId;
  await this.save();
};

/**
 * Unblock conversation
 */
conversationSchema.methods.unblock = async function () {
  this.isBlocked = false;
  this.blockedBy = null;
  await this.save();
};

/**
 * Archive conversation (soft delete)
 */
conversationSchema.methods.archive = async function () {
  this.isActive = false;
  await this.save();
};

/**
 * Static method to find or create conversation between two users
 */
conversationSchema.statics.findOrCreate = async function (
  participantIds,
  ticketId = null,
  ticketInfo = null
) {
  // Sort participant IDs to ensure consistent lookup
  const sortedParticipants = [...participantIds].sort();

  let query = {
    participants: { $all: sortedParticipants, $size: sortedParticipants.length },
  };

  if (ticketId) {
    query.ticket = ticketId;
  }

  let conversation = await this.findOne(query);

  if (!conversation) {
    conversation = new this({
      participants: sortedParticipants,
      ticket: ticketId,
      ticketInfo: ticketInfo,
      type: ticketId ? 'ticket_inquiry' : 'direct',
    });
    await conversation.save();
  }

  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;

