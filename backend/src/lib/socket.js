import { Server } from "socket.io";

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user-specific room
    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room`);
    });

    // Leave user-specific room
    socket.on("leave", (userId) => {
      socket.leave(`user:${userId}`);
      console.log(`User ${userId} left room`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

// Get io instance
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Emit notification to specific user
export const emitNotificationToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit notification to all users with specific role
export const emitNotificationToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};
