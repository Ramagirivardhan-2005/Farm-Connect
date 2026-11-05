import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import connectDB from './config/database.js';
import { setupSocketIO } from './sockets/socketHandler.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO (Instruction 56)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketIO(io);

// Connect DB & start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌾 FarmConnect API Server is running on port ${PORT}`);
    console.log(`🚀 Client Gateway: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🔐 State Machine: 13 States Enforced`);
    console.log(`⚡ WebSocket Server: Ready for Real-Time Dispatch Tracking`);
    console.log(`=======================================================`);
  });
});

export { server, io };
