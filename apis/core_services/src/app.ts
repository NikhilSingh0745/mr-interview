import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());
const basePath = "yourBasePath";

app.get(`/test`, (req, res, next) => {
  res.json({ message: "Hello World" });
});

// global error handle
app.use(globalErrorHandler);

export default app;
