# Spangles Chat App

A full-stack social media chat application built with React.js frontend, Node.js/Express backend, MongoDB, and real-time features using Socket.IO.

## Features

### Core Functionality
- **User Authentication**: JWT-based login/register with session management
- **Real-time Chat**: One-to-one and group messaging with Socket.IO
- **Social Media Posts**: Create, like, comment on posts with media upload
- **User Profiles**: Complete profile management with followers/following system
- **Search & Explore**: Find users and discover content
- **Notifications**: Real-time notification system
- **Media Support**: Image and video upload with error handling

### Real-time Features
- Live messaging with typing indicators
- Real-time notifications for likes, follows, and comments
- Online status indicators
- Instant feed updates

### UI/UX Features
- **Responsive Design**: Mobile-first approach with Material-UI
- **Dark/Light Theme**: Clean, modern interface
- **Progressive Loading**: Skeleton screens and lazy loading
- **Error Handling**: Graceful error states with fallback images
- **Mobile Optimized**: Touch-friendly interface with swipe gestures

## Tech Stack

### Frontend
- **React.js** with Hooks and Context API
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **React Query** for data fetching and caching
- **Socket.IO Client** for real-time communication

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **Multer** for file upload handling
- **bcryptjs** for password hashing

### Development Tools
- **ESLint** for code quality
- **CORS** for cross-origin requests
- **dotenv** for environment management

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatapp
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` files in both server and client directories:

   **Server (.env)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/spangles_chat
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

   **Client (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

5. **Start the application**
   
   **Terminal 1 - Start Server:**
   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Start Client:**
   ```bash
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Production Deployment

### Build for Production

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   ```

3. **Deploy using your preferred method**
   - **Heroku**: Use the included Procfile
   - **Digital Ocean**: Use PM2 for process management
   - **AWS**: Deploy using EC2 or Elastic Beanstalk
   - **Vercel/Netlify**: For frontend only (requires separate backend deployment)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/follow` - Follow user
- `POST /api/users/unfollow` - Unfollow user
- `GET /api/users/:id/followers` - Get user followers
- `GET /api/users/:id/following` - Get user following

### Posts
- `GET /api/posts/feed` - Get user feed
- `POST /api/posts` - Create new post
- `GET /api/posts/user/:username` - Get user posts
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post

### Chat
- `GET /api/chat` - Get user chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/:id/messages` - Get chat messages
- `POST /api/chat/:id/messages` - Send message

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/count` - Get notification count
- `PUT /api/notifications/:id/read` - Mark notification as read

## Socket.IO Events

### Client Events
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing` - Typing indicator

### Server Events
- `new_message` - Receive new message
- `user_typing` - User typing status
- `new_notification` - Real-time notifications
- `notification_count_update` - Update notification count

## Project Structure

```
chatapp/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── socket/            # Socket.IO handlers
│   ├── utils/             # Utility functions
│   ├── index.js           # Server entry point
│   └── package.json
└── README.md
```

## Key Features Implementation

### Real-time Chat
- Socket.IO integration for instant messaging
- Room-based chat system for groups
- Message delivery status and typing indicators
- Optimistic UI updates for smooth user experience

### Authentication & Security
- JWT token-based authentication
- Password hashing with bcryptjs
- Session management with configurable expiration
- Protected routes and middleware validation

### File Upload System
- Image and video upload support
- File type and size validation
- Error handling with fallback images
- Optimized serving of static files

### Responsive Design
- Mobile-first responsive layout
- Material-UI components with custom theming
- Touch-friendly interface elements
- Adaptive navigation for different screen sizes

## Demo Data

The application includes a demo data generator that creates sample users, posts, and chats for testing purposes. Access it through the home page "Load Demo Data" button.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@spangles.com or create an issue in the repository.

---

**Spangles Chat App** - Connecting people through real-time communication and social interaction.
