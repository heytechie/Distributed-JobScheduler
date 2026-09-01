import express from "express";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import jobRoutes from '../src/modules/jobs/job.route.js'
const app = express();

app.use(requestLogger);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/jobs",jobRoutes);
app.use(errorHandler);

export default app;