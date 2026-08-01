import { env } from "./config/env"; // first: loads + validates .env before anything reads process.env
import express from "express";
import type { Request, Response } from "express";
import routes from "./routes/index";
import { requestContext } from "./middleware/requestContext";
import { metricsMiddleware } from "./middleware/metrics";
import { register } from "./metrics/registry";
// @ts-ignore - express-fileupload doesn't ship TypeScript declarations in this project setup.
import fileUpload from "express-fileupload";

const app: express.Application = express();

// Correlation id + structured request logging + latency metrics for every request.
app.use(requestContext);
app.use(metricsMiddleware);

app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true
  })
);
app.use(express.text({ type: ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"] }));
app.use(express.json());

// Prometheus metrics (not rate-limited — it lives outside /api).
app.get("/metrics", async (_req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Mount all routes
app.use(routes);

app.get("/", (_req: Request, res: Response) => {
  return res.json({
    message: "FCR Server is up and running",
  });
});

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
});

export default app;
