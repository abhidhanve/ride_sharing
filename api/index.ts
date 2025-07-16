import { Hono } from "hono";
import { cors } from "hono/cors";
// import env from "../env";

// Import route handlers
import userRoutes from "./routes/user";
import rideRoutes from "./routes/ride";
// import driverRoutes from "../routes/driver";
// import feedbackRoutes from "../routes/feedback";

const app = new Hono();

// Setup CORS
app.use(
  cors({
    origin: (origin, ctx) => {
      const selfUrl = new URL(ctx.req.url);
      const selfOrigin = selfUrl.origin;
      if (!origin || origin === selfOrigin) {
        return origin;
      }
      return "";
    },
    credentials: true,
    allowMethods: ["POST", "GET", "PUT", "OPTIONS", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Register route modules
app.route("/user", userRoutes);
app.route("/ride", rideRoutes);
// app.route("/driver", driverRoutes);
// app.route("/feedback", feedbackRoutes);

// (Optional: expose internal stats)
let servedSessions = 0;
app.get("/stats", (ctx) => {
  servedSessions++;
  return ctx.json({
    servedSessions,
    // privyAppId: env.PRIVY_APP_ID,
  });
});

export default app;
