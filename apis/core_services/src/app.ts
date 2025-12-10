import express from "express";
import { globalErrorHandler } from "./core/helper/globalErrorHandler";
import cors from "cors";
import { authenticateUser } from "./middlewares/authMiddleware";
import routes from "./routes";

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

