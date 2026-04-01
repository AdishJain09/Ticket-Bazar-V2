import express from 'express';
import {
  getOrCreateConversation,
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  getUnreadCount,
  archiveConversation,
  blockConversation,
  unblockConversation,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadChatAttachment } from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', authenticate, getConversations);

/**
 * @route   POST /api/chat/conversations
 * @desc    Get or create conversation
 * @access  Private
 */
router.post('/conversations', authenticate, getOrCreateConversation);

/**
 * @route   GET /api/chat/conversations/:id
 * @desc    Get single conversation with messages
 * @access  Private
 */
router.get('/conversations/:id', authenticate, getConversation);

/**
 * @route   POST /api/chat/conversations/:id/messages
 * @desc    Send message
 * @access  Private
 */
router.post(
  '/conversations/:id/messages',
  authenticate,
  uploadChatAttachment.single('attachment'),
  sendMessage
);

/**
 * @route   PUT /api/chat/conversations/:id/read
 * @desc    Mark conversation as read
 * @access  Private
 */
router.put('/conversations/:id/read', authenticate, markAsRead);

/**
 * @route   PUT /api/chat/conversations/:id/archive
 * @desc    Archive conversation
 * @access  Private
 */
router.put('/conversations/:id/archive', authenticate, archiveConversation);

/**
 * @route   PUT /api/chat/conversations/:id/block
 * @desc    Block conversation
 * @access  Private
 */
router.put('/conversations/:id/block', authenticate, blockConversation);

/**
 * @route   PUT /api/chat/conversations/:id/unblock
 * @desc    Unblock conversation
 * @access  Private
 */
router.put('/conversations/:id/unblock', authenticate, unblockConversation);

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread-count', authenticate, getUnreadCount);

export default router;
