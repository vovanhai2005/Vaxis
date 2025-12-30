import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: false,
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const connectSocket = (userId) => {
  const socketInstance = getSocket();
  
  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  // Join user-specific room after connection is established
  if (userId) {
    if (socketInstance.connected) {
      socketInstance.emit("join", userId);
    } else {
      // Wait for connection before joining room
      socketInstance.once("connect", () => {
        socketInstance.emit("join", userId);
        console.log(`Socket connected and joined room for user ${userId}`);
      });
    }
  }

  return socketInstance;
};

export const disconnectSocket = (userId) => {
  if (socket) {
    // Leave user-specific room
    if (userId) {
      socket.emit("leave", userId);
    }
    socket.disconnect();
  }
};

// Listen to notification events
export const onNewNotification = (callback) => {
  const socketInstance = getSocket();
  // Remove any existing listener to prevent duplicates
  socketInstance.off("notification:new");
  socketInstance.on("notification:new", (data) => {
    console.log("Socket received notification:new event:", data);
    callback(data);
  });
};

export const onNotificationRead = (callback) => {
  const socketInstance = getSocket();
  socketInstance.off("notification:read");
  socketInstance.on("notification:read", callback);
};

export const onNotificationReadAll = (callback) => {
  const socketInstance = getSocket();
  socketInstance.off("notification:readAll");
  socketInstance.on("notification:readAll", callback);
};

export const onNotificationDeleted = (callback) => {
  const socketInstance = getSocket();
  socketInstance.off("notification:deleted");
  socketInstance.on("notification:deleted", callback);
};

// Remove listeners
export const removeNotificationListeners = () => {
  if (socket) {
    socket.off("notification:new");
    socket.off("notification:read");
    socket.off("notification:readAll");
    socket.off("notification:deleted");
  }
};
