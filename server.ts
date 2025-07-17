import { Hono } from "hono";
import { logger } from "hono/logger";
import path from "path";
import { fileURLToPath } from "url";
import api from "./api";
import { ensureEnv } from "./env";
import staticRequestsHandler from "./api/middleware/staticRequestsHandler";

const isProd =
  process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";

// In development, run `bun run dev` to start Vite for frontend and backend API for backend.
// In production, serve static files from /dist (built by Vite) and handle API routes.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

const log = (...data: any[]) => console.log(...data);

app.use(logger(log));
app.use((ctx, next) => {
  ctx.log = log;
  return next();
});

// Load env
ensureEnv();

// API routes
app.route("/api", api);

// Health route
app.get("/health", (ctx) => ctx.json({ status: "ok" }));

if (isProd) {
  log("Production mode: Serving static files from /dist");

  // Serve static frontend assets
  app.use("/*", staticRequestsHandler(path.join(__dirname, "dist")));

  // Serve index.html for SPA routes (frontend)
  app.get("*", async (ctx) => {
    const file = Bun.file(path.join(__dirname, "dist", "index.html"));
    if (!(await file.exists())) return ctx.text("index.html not found", 404);
    return ctx.html(await file.text());
  });
} else {
  log("Development mode: Use Vite dev server for frontend (http://localhost:5173)");
  log("Backend API available at http://localhost:3000/api");
  // No static serving in dev; Vite handles frontend. Only API routes are handled here.
}

export default {
  ...app,
  maxRequestBodySize: 4 * 1024 * 1024, // 4 MB
};

declare module "hono" {
  interface Context {
    log: (...data: any[]) => void;
  }
}
