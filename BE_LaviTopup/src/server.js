require("dotenv").config();
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./sockets/websocket");

const PORT = Number(process.env.PORT || 5000);
const SOCKET_PORT = Number(process.env.SOCKET_PORT || 8443);

const server = http.createServer(app);
const socketServer = http.createServer();

const getSocketOrigins = () => {
  const originsEnv = process.env.SOCKET_ORIGINS || process.env.CORS_ORIGINS;
  if (originsEnv) {
    return originsEnv
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  if (process.env.FRONTEND_URL) {
    return [process.env.FRONTEND_URL.trim()];
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("[socket] Production mode nhưng chưa cấu hình SOCKET_ORIGINS hoặc FRONTEND_URL");
  }

  return true;
};

const socketOrigins = getSocketOrigins();
const io = new Server(socketServer, {
  cors: {
    origin: socketOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocket(io);

server.listen(PORT, () => {
  console.log(`[api] Server running on port ${PORT}`);
});

socketServer.listen(SOCKET_PORT, () => {
  console.log(`[socket] Socket.IO server running on port ${SOCKET_PORT}`);
});

const { initCronJobs } = require("./services/cron.service");
initCronJobs().catch((error) => {
  console.error("Failed to initialize cron jobs:", error);
});