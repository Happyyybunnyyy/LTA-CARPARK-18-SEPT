import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import healthHandler from "./api/health.ts";
import carparkAvailabilityHandler from "./api/carparkavailability.ts";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount serverless endpoints under /api
  app.all("/api/health", (req, res) => healthHandler(req, res));
  app.all("/api/health.ts", (req, res) => healthHandler(req, res));
  app.all("/api/carparkavailability", (req, res) => carparkAvailabilityHandler(req, res));
  app.all("/api/carparkavailability.ts", (req, res) => carparkAvailabilityHandler(req, res));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
