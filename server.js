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
    const handshake = socket.handshake;
    const ip =
      (handshake.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      handshake.address ||
      socket.conn.remoteAddress ||
      "unknown-ip";
    const origin = handshake.headers.origin || handshake.headers.referer || "unknown-origin";
    const userAgent = handshake.headers["user-agent"] || "unknown-agent";
    const transport = socket.conn.transport.name; // 'websocket' or 'polling'

    // Detect device / client platform
    let device = "Desktop / Web Browser";
    const ua = userAgent.toLowerCase();
    if (ua.includes("android") || ua.includes("okhttp")) {
      device = "Android Device";
    } else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("cfnetwork") || ua.includes("darwin")) {
      device = "iOS Device";
    } else if (ua.includes("mobile")) {
      device = "Mobile Web Browser";
    } else if (ua.includes("postman") || ua.includes("insomnia") || ua.includes("curl")) {
      device = "API Client";
    }

    // Attach info to socket object for convenience
    socket.clientInfo = { ip, device, origin, userAgent, transport };

    console.log(
      `🔌 [Socket.io Connected] ID: ${socket.id} | Device: [${device}] | IP: ${ip} | Transport: ${transport} | Origin: ${origin} | UA: ${userAgent}`
    );

    // Log ANY incoming event/message sent by client over socket with device & IP
    socket.onAny((eventName, ...args) => {
      console.log(
        `📩 [Socket.io Event] '${eventName}' | From: ${socket.id} | Device: [${device}] | IP: ${ip} | Data:`,
        JSON.stringify(args)
      );
    });

    // Driver joins available rides room
    socket.on("join:available_rides", () => {
      socket.join("available_rides");
      console.log(`🚖 [Socket.io] Driver joined 'available_rides' room | ID: ${socket.id} | Device: [${device}] | IP: ${ip}`);
    });

    // Leave available rides room
    socket.on("leave:available_rides", () => {
      socket.leave("available_rides");
      console.log(`🚖 [Socket.io] Driver left 'available_rides' room | ID: ${socket.id} | Device: [${device}] | IP: ${ip}`);
    });

    // Client/Driver joins specific booking room (for live tracking/updates)
    socket.on("join:booking", (bookingId) => {
      if (bookingId) {
        socket.join(`booking:${bookingId}`);
        console.log(`📍 [Socket.io] Socket joined 'booking:${bookingId}' | ID: ${socket.id} | Device: [${device}] | IP: ${ip}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ [Socket.io Disconnected] ID: ${socket.id} | Device: [${device}] | IP: ${ip} | Reason: ${reason}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> 🚀 Ready on http://${hostname}:${port} with Socket.io enabled`);
  });
});
