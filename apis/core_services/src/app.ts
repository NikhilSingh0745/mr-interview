import express from "express";
import { globalErrorHandler } from "./core/helper/globalErrorHandler";
import cors from "cors";
import routes from "./routes";
import { authenticateUser } from "./middlewares/authMiddleware";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());

app.get(`/test`, (req, res, next) => {
  res.json({ message: "Hello World" });
});

// API Routes
app.use(`/api`, authenticateUser, routes)

// Global error handler
app.use(globalErrorHandler);

export default app;

