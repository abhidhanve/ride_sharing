import { Hono } from "hono";
import { cors } from "hono/cors";
import env from "../env";
import { authMiddleware } from "./middleware/authMiddleware";


import userRoutes from "./routes/user";
import rideRoutes from "./routes/ride";
import matchDriverRoutes from "./routes/matchDriver";
import driverAvailabilityRoutes from "./routes/driverAvaliability"; 

const app = new Hono();

// Setup CORS
// app.use(
//   cors({
//     origin: (origin, ctx) => {
//       const selfUrl = new URL(ctx.req.url);
//       const selfOrigin = selfUrl.origin;
//       if (!origin || origin === selfOrigin) {
//         return origin;
//       }
//       return "";
//     },
//     credentials: true,
//     allowMethods: ["POST", "GET", "PUT", "OPTIONS", "DELETE"],
//     allowHeaders: ["Content-Type", "Authorization"],
//   }),
// );
app.use(
  cors({
    origin: (origin, ctx) => {
      // Allow requests from Vite dev server and same-origin
      if (
        origin === "http://localhost:5173" ||
        origin === "http://127.0.0.1:5173" ||
        origin === undefined // for same-origin/fetch
      ) {
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
app.route("/matchdriver", matchDriverRoutes);
app.route("/driveravailability", driverAvailabilityRoutes);





// Protected route example
app.get("/protected", authMiddleware, (ctx) => {
  const user = (ctx as any).get("user");
  return ctx.json({
    message: "You have accessed a protected route!",
    user,
  });
});

let servedSessions = 0;
app.get("/stats", (ctx) => {
  servedSessions++;
  return ctx.json({
    servedSessions,
    privyAppId: env.PRIVY_APP_ID,
  });
});

export default app;
