# 🎫 Ticket Bazar - C2C Ticket Marketplace

A full-stack web application for buying and selling tickets (train, bus, events) with custom pricing. Built with the MERN stack and real-time chat capabilities.

## 🚀 Features

### User Features
- ✅ User authentication (Signup/Login/Logout) with JWT
- ✅ Browse all available tickets with advanced filters
- ✅ Search & filter tickets by type, price, location
- ✅ View detailed ticket information
- ✅ Buy tickets with secure Razorpay payment gateway
- ✅ Real-time chat with sellers before purchase
- ✅ View order history and purchased tickets

### Seller Features
- ✅ Create/list tickets for sale with images
- ✅ Upload ticket proof (images)
- ✅ Set custom resale price
- ✅ Edit/Delete ticket listings
- ✅ Track ticket status (available/sold)
- ✅ Manage sales orders

### Admin Features
- ✅ Dashboard with statistics
- ✅ Approve/reject ticket listings
- ✅ Handle disputes and refunds
- ✅ Monitor all transactions
- ✅ User management

### Advanced Features
- ✅ Ticket verification system (admin approval)
- ✅ Escrow payment system
- ✅ Real-time notifications
- ✅ Responsive UI (mobile + desktop)
- ✅ Fraud detection (flagging system)

## 🛠️ Tech Stack

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Socket.io-client** for real-time features
- **Axios** for API requests
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Socket.io** for real-time chat
- **Razorpay** for payments
- **Cloudinary** for file uploads
- **Bcryptjs** for password hashing

## 📁 Project Structure

```
ticket-bazar/
├── backend/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── cloudinary.js    # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   ├── orderController.js
│   │   ├── chatController.js
│   │   ├── adminController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   ├── errorHandler.js  # Error handling
│   │   └── upload.js        # File upload middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Ticket.js
│   │   ├── Order.js
│   │   ├── Chat.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   ├── orders.js
│   │   ├── chat.js
│   │   ├── admin.js
│   │   └── notifications.js
│   ├── socket/
│   │   └── index.js         # Socket.io handlers
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   └── AuthLayout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── SellerRoute.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   └── TicketCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── BrowseTickets.jsx
│   │   │   ├── TicketDetails.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyOrders.jsx
│   │   │   │   ├── MyTickets.jsx
│   │   │   │   ├── CreateTicket.jsx
│   │   │   │   ├── EditTicket.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── Messages.jsx
│   │   │   │   └── SellerOrders.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       ├── AdminTickets.jsx
│   │   │       └── AdminOrders.jsx
│   │   ├── context/
│   │   │   ├── authStore.js
│   │   │   └── socketStore.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Razorpay account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ticket-bazar
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# - MongoDB URI
# - JWT Secret
# - Cloudinary credentials
# - Razorpay credentials
```

**Backend .env:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticket-bazar
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

```bash
# Start development server
npm run dev

# Or for production
npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Frontend .env:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

```bash
# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📱 Usage

### For Buyers
1. Browse available tickets on the home page
2. Use filters to find specific tickets
3. Click on a ticket to view details
4. Chat with the seller if needed
5. Click "Buy Now" and complete payment
6. View your orders in the dashboard

### For Sellers
1. Sign up and become a seller
2. Go to Dashboard → My Tickets
3. Click "List New Ticket"
4. Fill in ticket details and upload images
5. Wait for admin approval
6. Manage your sales in the dashboard

### For Admins
1. Login with admin credentials
2. Access the admin dashboard
3. Review and approve/reject tickets
4. Monitor all orders and transactions
5. Handle disputes and refunds

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/become-seller` - Become a seller

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create ticket (Seller)
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Orders
- `POST /api/orders` - Create order
- `POST /api/orders/verify-payment` - Verify payment
- `GET /api/orders/my-orders` - Get my orders
- `GET /api/orders/seller-orders` - Get seller orders

### Chat
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/conversations` - Create conversation
- `POST /api/chat/conversations/:id/messages` - Send message

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/tickets` - Get all tickets
- `PUT /api/admin/tickets/:id/verify` - Verify ticket

## 🔐 Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT |
| CLOUDINARY_* | Cloudinary credentials |
| RAZORPAY_* | Razorpay credentials |
| PORT | Server port (default: 5000) |

### Frontend
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL |
| VITE_SOCKET_URL | Socket.io server URL |
| VITE_RAZORPAY_KEY_ID | Razorpay public key |

## 🚢 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Add environment variables
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### MongoDB Atlas
1. Create cluster
2. Set up database access
3. Configure network access
4. Get connection string

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@ticketbazar.com or join our Slack channel.

---

Built with ❤️ by the Ticket Bazar Team
