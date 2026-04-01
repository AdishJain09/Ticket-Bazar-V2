# Ticket Bazar - Startup Guide

Complete step-by-step instructions to start the Ticket Bazar full-stack application.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git (optional)

## Project Structure

```
ticket-bazar/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite app
└── STARTUP_GUIDE.md  # This file
```

---

## Step 1: Clone/Navigate to Project

```bash
# If using Git
git clone <repository-url>
cd ticket-bazar

# Or navigate to existing folder
cd "d:\All Project\qoder\ticket-bazar"
```

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Folder
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Configure Environment Variables

Create a `.env` file in the `backend` folder with the following:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ticketbazar?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=super_secret_jwt_key_for_ticket_bazar_2024
JWT_EXPIRE=7d

# Cloudinary Configuration (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Configuration (optional - for payments)
RAZORPAY_KEY_ID=rzp_test_key
RAZORPAY_KEY_SECRET=rzp_test_secret

# Server Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Admin Configuration
ADMIN_EMAIL=admin@ticketbazar.com
ADMIN_PASSWORD=admin123
```

**Note:** Replace `MONGODB_URI` with your actual MongoDB Atlas connection string.

### 2.4 Seed Database (Optional - For Demo Data)
```bash
npm run seed
```

This creates:
- 5 demo users (admin, sellers, buyers)
- 10 demo tickets (concerts, flights, events)
- 2 demo orders

### 2.5 Start Backend Server
```bash
npm run dev
```

**Backend will start on:** http://localhost:5001

You should see:
```
🎫 Ticket Bazar Server Running
Server URL: http://localhost:5001
MongoDB Connected: xxx.mongodb.net
```

---

## Step 3: Frontend Setup

### 3.1 Open New Terminal
Keep the backend terminal running and open a new terminal window.

### 3.2 Navigate to Frontend Folder
```bash
cd "d:\All Project\qoder\ticket-bazar\frontend"
```

### 3.3 Install Dependencies
```bash
npm install
```

### 3.4 Configure Environment Variables

Create a `.env` file in the `frontend` folder:

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# Socket.io Configuration
VITE_SOCKET_URL=http://localhost:5001

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_key
```

### 3.5 Start Frontend Development Server
```bash
npm run dev
```

**Frontend will start on:** http://localhost:5173

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## Step 4: Access the Application

Open your browser and go to:

**http://localhost:5173**

---

## Demo Credentials

Use these accounts to test the application:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ticketbazar.com | admin123 |
| **Seller** | seller@ticketbazar.com | seller123 |
| **Buyer** | buyer@ticketbazar.com | Buy@Ticket2024 |
| **Seller** | mike@example.com | password123 |
| **Buyer** | sarah@example.com | password123 |

---

## Common Commands

### Backend Commands
```bash
# Start development server
npm run dev

# Seed database with demo data
npm run seed

# Start production server
npm start
```

### Frontend Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:**
- Check if backend is running on port 5001
- Verify `CLIENT_URL` in backend `.env` matches frontend port (5173)
- Check CORS settings

### Issue: "MongoDB connection failed"
**Solution:**
- Verify MongoDB URI in backend `.env`
- Check if IP address is whitelisted in MongoDB Atlas
- Ensure network access is allowed

### Issue: "Port already in use"
**Solution:**
```bash
# Kill process on port 5001 (Windows)
npx kill-port 5001

# Or change port in .env
PORT=5002
```

### Issue: "No tickets showing"
**Solution:**
- Run `npm run seed` in backend folder
- Check browser console for errors
- Verify backend is connected to MongoDB

### Issue: "Animation not visible"
**Solution:**
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

---

## Features Available

✅ **Authentication** - Sign up, Login, Logout  
✅ **Browse Tickets** - View all available tickets  
✅ **Buy Tickets** - Purchase flow with checkout  
✅ **Sell Tickets** - List tickets for sale (seller role)  
✅ **My Orders** - View purchase history  
✅ **Profile** - Edit profile, change password  
✅ **Chat** - Message sellers/buyers  
✅ **Admin Panel** - Manage users, tickets, orders  
✅ **Interactive Background** - Particle animation  

---

## Production Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy `dist` folder
3. Set environment variables
4. Update API URL to point to deployed backend

---

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (real-time chat)
- Cloudinary (image uploads)
- Razorpay (payments)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router
- Axios
- React Hot Toast

---

## Support

For issues or questions, check:
- Browser console (F12) for errors
- Backend terminal for server logs
- MongoDB Atlas dashboard for database status
