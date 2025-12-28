import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:8000", {
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

  // Join user-specific room
  if (userId) {
    socketInstance.emit("join", userId);
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
  socketInstance.on("notification:new", callback);
};

export const onNotificationRead = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on("notification:read", callback);
};

export const onNotificationReadAll = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on("notification:readAll", callback);
};

export const onNotificationDeleted = (callback) => {
  const socketInstance = getSocket();
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
