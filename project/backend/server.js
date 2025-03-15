require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup for real-time updates
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Join university-specific room for real-time updates
  socket.on('joinUniversity', (universityId) => {
    socket.join(`university-${universityId}`);
  });
  
  // Join facility-specific room
  socket.on('joinFacility', (facilityId) => {
    socket.join(`facility-${facilityId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to the rest of the application
app.set('io', io);

// Set port
const PORT = process.env.PORT || 5000;

// Connect to database then start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});


