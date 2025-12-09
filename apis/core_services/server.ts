import app from "./src/app";
import { config } from "./src/config/config";
import { connectDB, disconnectDB } from "./src/config/db";


const PORT = Number(config.get('port') || 5000);
let server: ReturnType<typeof app.listen> | undefined;

const start = async () => {
  try {
    console.log('🟡 Connecting to services...');
    await Promise.all([connectDB()]);
    console.log('🟢 Services connected');

    server = app.listen(PORT, () => {
      console.log(`✅ Server started at http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log('🟠 Shutting down server...');

      // Close HTTP server and wait for it to finish
      await new Promise<void>((resolve) => {
        if (server) {
          server.close(() => {
            console.log('🔴 HTTP server closed');
            resolve();
          });
        } else {
          resolve();
        }
      });

      // Then close all other services
      const services = [
        { name: 'MongoDB', fn: disconnectDB },
      ];

      await Promise.allSettled(
        services.map(async (service) => {
          try {
            await service.fn();
            console.log(`🧩 ${service.name} disconnected`);
            return { success: true, service: service.name };
          } catch (error) {
            console.error(`❌ Failed to close ${service.name}:`, error);
            return { success: false, service: service.name, error };
          }
        })
      );

      console.log('🟢 All services closed');
      process.exit(0);
    };

    // Use regular function in listeners and call shutdown from there,
    ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach((signal) => {
      process.once(signal, () => {
        shutdown().catch((err) => {
          console.error('❌ Error during shutdown:', err);
        });
      });
    });


  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
};

start();
