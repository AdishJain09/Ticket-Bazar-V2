import { Conversation, User } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import cloudinary from '../config/cloudinary.js';

/**
 * @desc    Get or create conversation
 * @route   POST /api/chat/conversations
 * @access  Private
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { participantId, ticketId, ticketInfo } = req.body;

  // Validate participant exists
  const participant = await User.findById(participantId);
  if (!participant) {
    throw new AppError('Participant not found', 404);
  }

  // Cannot start conversation with self
  if (participantId === req.user._id.toString()) {
    throw new AppError('Cannot start conversation with yourself', 400);
  }

  const participantIds = [req.user._id.toString(), participantId];

  const conversation = await Conversation.findOrCreate(
    participantIds,
    ticketId || null,
    ticketInfo || null
  );

  res.status(200).json({
    success: true,
    data: { conversation },
  });
});

/**
 * @desc    Get user's conversations
 * @route   GET /api/chat/conversations
 * @access  Private
 */
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true,
  })
    .populate('participants', 'name avatar')
    .populate('ticket', 'title images resalePrice')
    .sort({ 'lastMessage.sentAt': -1 });

  // Add unread count for each conversation
  const conversationsWithUnread = conversations.map((conv) => ({
    ...conv.toObject(),
    unreadCount: conv.getUnreadCount(req.user._id),
  }));

  res.status(200).json({
    success: true,
    data: { conversations: conversationsWithUnread },
  });
});

/**
 * @desc    Get single conversation with messages
 * @route   GET /api/chat/conversations/:id
 * @access  Private
 */
export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate('participants', 'name avatar')
    .populate('ticket', 'title images resalePrice seller');

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  // Check if user is participant
  if (!conversation.participants.some((p) => p._id.toString() === req.user._id.toString())) {
    throw new AppError('Not authorized to view this conversation', 403);
  }

  // Mark messages as read
  await conversation.markAsRead(req.user._id);

  res.status(200).json({
    success: true,
    data: { conversation },
  });
});

/**
 * @desc    Send message
 * @route   POST /api/chat/conversations/:id/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, messageType = 'text', replyTo } = req.body;

  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  // Check if user is participant
  if (!conversation.participants.includes(req.user._id)) {
    throw new AppError('Not authorized to send messages', 403);
  }

  // Check if conversation is blocked
  if (conversation.isBlocked) {
    throw new AppError('Conversation is blocked', 403);
  }

  let fileUrl = null;
  let fileName = null;

  // Handle file upload
  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ticket-bazar/chat',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    fileUrl = result.secure_url;
    fileName = req.file.originalname;
  }

  const message = await conversation.addMessage({
    sender: req.user._id,
    senderName: req.user.name,
    content: content || '',
    messageType: req.file ? 'file' : messageType,
    fileUrl,
    fileName,
    replyTo: replyTo || null,
  });

  res.status(201).json({
    success: true,
    data: { message },
  });
});

/**
 * @desc    Mark conversation as read
 * @route   PUT /api/chat/conversations/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!conversation.participants.includes(req.user._id)) {
    throw new AppError('Not authorized', 403);
  }

  await conversation.markAsRead(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Conversation marked as read',
  });
});

/**
 * @desc    Get unread message count
 * @route   GET /api/chat/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true,
  });

  const totalUnread = conversations.reduce((sum, conv) => {
    return sum + (conv.getUnreadCount(req.user._id) || 0);
  }, 0);

  res.status(200).json({
    success: true,
    data: { unreadCount: totalUnread },
  });
});

/**
 * @desc    Archive conversation
 * @route   PUT /api/chat/conversations/:id/archive
 * @access  Private
 */
export const archiveConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!conversation.participants.includes(req.user._id)) {
    throw new AppError('Not authorized', 403);
  }

  await conversation.archive();

  res.status(200).json({
    success: true,
    message: 'Conversation archived',
  });
});

/**
 * @desc    Block conversation
 * @route   PUT /api/chat/conversations/:id/block
 * @access  Private
 */
export const blockConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!conversation.participants.includes(req.user._id)) {
    throw new AppError('Not authorized', 403);
  }

  await conversation.block(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Conversation blocked',
  });
});

/**
 * @desc    Unblock conversation
 * @route   PUT /api/chat/conversations/:id/unblock
 * @access  Private
 */
export const unblockConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!conversation.participants.includes(req.user._id)) {
    throw new AppError('Not authorized', 403);
  }

  await conversation.unblock();

  res.status(200).json({
    success: true,
    message: 'Conversation unblocked',
  });
});

export default {
  getOrCreateConversation,
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  getUnreadCount,
  archiveConversation,
  blockConversation,
  unblockConversation,
};
