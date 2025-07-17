import { PrivyClient } from '@privy-io/server-auth';
import type { MiddlewareHandler } from "hono";
import env from "../../env"; // Ensure this points to your env module
import db from "../lib/db";
import { users } from "../lib/db/schema/user";
import { eq } from "drizzle-orm";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  console.log("Authenticating request...");

  const PRIVY_APP_ID = env.PRIVY_APP_ID;
  const PRIVY_APP_SECRET = env.PRIVY_APP_SECRET;
  const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

  const authHeader = c.req.header("Authorization");

  if (!authHeader || typeof authHeader !== "string" || !authHeader.trim().toLowerCase().startsWith("bearer ")) {
    console.warn("Missing or invalid Authorization header");
    return c.json({ error: "Unauthorized - Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "undefined" || token === "null") {
    console.warn("Token missing or invalid in Authorization header");
    return c.json({ error: "Unauthorized - Missing or invalid token" }, 401);
  }

  try {
    // Use verifyAuthToken for access tokens
    const session = await privy.verifyAuthToken(token);

    if (!session || !session.userId) {
      console.warn("Privy returned no session for token");
      return c.json({ error: "Invalid token" }, 401);
    }

    c.set("user", session); // You can later access it in handlers using c.get("user")
    await next();
  } catch (err) {
    // Log the error object and all its properties for better debugging
    try {
      console.error("Auth error (full):", err, JSON.stringify(err, Object.getOwnPropertyNames(err)));
    } catch (jsonErr) {
      console.error("Auth error (raw):", err);
    }
    let errorMsg = "Auth failed";
    if (err && typeof err === "object" && "message" in err) {
      errorMsg = `Auth failed: ${err.message}`;
    }
    return c.json({ error: errorMsg }, 401);
  }
};


export const isAuthenticated: MiddlewareHandler = async (c, next) => {
  console.log("Checking authentication...");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};


export const isAccountOwner: MiddlewareHandler = async (c, next) => {
  console.log("Checking account ownership...");
  const session = c.get("user");
  const paramId = Number(c.req.param("id"));

  if (!session || isNaN(paramId)) {
    return c.json({ error: "Forbidden - Not your account" }, 403);
  }

  // Fetch user from DB by internal id
  const result = await db.select().from(users).where(eq(users.id, paramId));
  if (result.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

const sessionPrivyId = session.userId?.replace("did:privy:", "");

console.log("Session Privy ID:", sessionPrivyId);
console.log("DB Privy ID:", result[0]?.privyId);

if (result[0]?.privyId !== sessionPrivyId) {
  return c.json({ error: "Forbidden - Not your account" }, 403);
}
  await next();
};



export const isAdmin: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");

  if (!user || !user.isAdmin) {
    return c.json({ error: "Forbidden - Admin only" }, 403);
  }

  await next();
};
