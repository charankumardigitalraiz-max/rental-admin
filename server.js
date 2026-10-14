// server.js - Custom Next.js server with Socket.io integration
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Attach global io instance so Next.js App Router API routes can broadcast events
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    // Driver joins available rides room
    socket.on("join:available_rides", () => {
      socket.join("available_rides");
      console.log(`🚖 [Socket.io] Driver joined 'available_rides' room: ${socket.id}`);
    });

    // Leave available rides room
    socket.on("leave:available_rides", () => {
      socket.leave("available_rides");
      console.log(`🚖 [Socket.io] Driver left 'available_rides' room: ${socket.id}`);
    });

    // Client/Driver joins specific booking room (for live tracking/updates)
    socket.on("join:booking", (bookingId) => {
      if (bookingId) {
        socket.join(`booking:${bookingId}`);
        console.log(`📍 [Socket.io] Socket ${socket.id} joined 'booking:${bookingId}'`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ [Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> 🚀 Ready on http://${hostname}:${port} with Socket.io enabled`);
  });
});
