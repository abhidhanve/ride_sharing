import { Hono } from "hono";
import { logger } from "hono/logger";
import path from "path";
import { fileURLToPath } from "url";
import api from "./api";
import { ensureEnv } from "./env";
import staticRequestsHandler from "./api/middleware/staticRequestsHandler";

const isProd =
  process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";

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

  app.use("/*", staticRequestsHandler(path.join(__dirname, "dist")));

  // Optional: serve index.html fallback for SPA routing
  app.get("*", async (ctx) => {
    const file = Bun.file(path.join(__dirname, "dist", "index.html"));
    if (!(await file.exists())) return ctx.text("index.html not found", 404);
    return ctx.html(await file.text());
  });
} else {
  log("Development mode: No static files yet");

  // You can add dev-only logic here if needed later
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
