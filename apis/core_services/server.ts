import http from "http";
import { Server } from "socket.io";
import app from "./src/app";
import { initGemini } from "./src/core/config/gemini";
import { initSocket } from "./src/core/config/socketService";

const PORT = 3001;

async function start() {
  await initGemini();

  const server = http.createServer(app);

  const io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  initSocket(io);

  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });

  process.on("SIGINT", () => {
    console.log("🛑 Shutting down...");
    server.close(() => process.exit(0));
  });
}

start();
