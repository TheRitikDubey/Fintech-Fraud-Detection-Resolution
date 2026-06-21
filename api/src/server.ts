import { env } from "./config/env"; // first: loads + validates .env before anything reads process.env
import express from "express";
import type { Request, Response } from "express";
import routes from "./routes/index";
// @ts-ignore - express-fileupload doesn't ship TypeScript declarations in this project setup.
import fileUpload from "express-fileupload";

const app: express.Application = express();

app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true
  })
);
app.use(express.text({ type: ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"] }));
app.use(express.json());

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
