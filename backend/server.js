import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Database and Config
import { connectDB } from './config/database.js';
import { configureCloudinary } from './config/cloudinary.js';
import { seedDatabase } from './seed.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import {
  authRoutes,
  ticketRoutes,
  orderRoutes,
  chatRoutes,
  adminRoutes,
  notificationRoutes,
} from './routes/index.js';

// Socket handlers
import { initializeSocket } from './socket/index.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Connect to Database and handle auto-seeding
connectDB().then(async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Checking database state for initial demo initialization...');
    try {
      await seedDatabase(false);
    } catch (err) {
      console.error('Database auto-seeding encountered an error:', err);
    }
  }
});

// Configure Cloudinary
configureCloudinary();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads (if needed locally)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Ticket Bazar API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Initialize Socket.io handlers
initializeSocket(io);

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║           🎫 Ticket Bazar Server Running               ║
║                                                        ║
║   Server URL: http://localhost:${PORT}                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(16 - (process.env.NODE_ENV || 'development').length)}║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  httpServer.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

export { io };
export default app;
