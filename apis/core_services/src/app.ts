import express from "express";
import { globalErrorHandler } from "./core/helper/globalErrorHandler";
import cors from "cors";
import routes from "./routes";
import { authenticateUser } from "./middlewares/authMiddleware";

const app = express();
app.use(express.json());
app.use(cors());

app.get(`/test`, (req, res, next) => {
  res.json({ message: "Hello World" });
});

// API Routes
app.use(`/api`, authenticateUser, routes)

// Global error handler
app.use(globalErrorHandler);

export default app;

