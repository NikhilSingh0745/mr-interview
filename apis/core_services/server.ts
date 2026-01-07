import app from "./src/app";
import { config } from "./src/core/config/config";
import { connectDB, disconnectDB } from "./src/core/config/db";
import type { Server } from "http";

const PORT = Number(config.get("port")) || 5000;
const SHUTDOWN_TIMEOUT_MS = 10_000;

let server: Server | null = null;
let shuttingDown = false;

// Start server
async function start(): Promise<void> {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    ["SIGINT", "SIGTERM", "SIGUSR2"].forEach(signal => {
      process.on(signal, () => shutdown(signal as NodeJS.Signals));
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

// Shutdown server
async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Received ${signal}. Shutting down...`);

  const timeout = setTimeout(() => {
    console.error("Forced shutdown");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close(err => (err ? reject(err) : resolve()));
      });
    }

    await disconnectDB();

    clearTimeout(timeout);
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    console.error("Shutdown failed:", error);
    process.exit(1);
  }
}

start();
