import { Hono } from "hono";
import db from "../lib/db";
import { users } from "../lib/db/schema/user";
import type { InsertUser } from "../lib/db/schema/user";
import { eq } from "drizzle-orm";

import {
  authMiddleware,
  isAuthenticated,
  isAccountOwner,
} from "../middleware/authMiddleware"; // adjust path if needed

const app = new Hono();

// ✅ Signup - Public route
app.post("/", async (c) => {
  const body = await c.req.json();

  const newUser: InsertUser = {
    privyId: body.privyId,
    name: body.name,
    email: body.email,
    phone: body.phone,
    userType: body.userType, // 'rider' or 'driver'
    currentLat: body.currentLat,
    currentLng: body.currentLng,
  };

  const result = await db.insert(users).values(newUser).returning();
  return c.json({ message: "User created", user: result[0] });
});

// 🔐 List all users - Admin only (optional)
// You can add isAdmin here if you want this protected
app.get("/users", async (c) => {
  const result = await db.select().from(users);
  return c.json(result);
});

// 🔐 Get own user profile
app.get("/:id", authMiddleware, isAuthenticated, isAccountOwner, async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid user ID" }, 400);

  const result = await db.select().from(users).where(eq(users.id, id));
  if (result.length === 0) return c.json({ error: "User not found" }, 404);

  return c.json(result[0]);
});

// 🔐 Update own user profile
app.put("/:id", authMiddleware, isAuthenticated, isAccountOwner, async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

  const body = await c.req.json();

  const updated = await db
    .update(users)
    .set({
      name: body.name,
      email: body.email,
      phone: body.phone,
      userType: body.userType,
      currentLat: body.currentLat,
      currentLng: body.currentLng,
      isActive: body.isActive,
    })
    .where(eq(users.id, id))
    .returning();

  if (updated.length === 0) return c.json({ error: "User not found" }, 404);

  return c.json(updated[0]);
});

// 🔐 Delete own user account
app.delete("/:id", authMiddleware, isAuthenticated, isAccountOwner, async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

  const deleted = await db.delete(users).where(eq(users.id, id)).returning();
  if (deleted.length === 0) return c.json({ error: "User not found" }, 404);

  return c.json({ message: "User deleted", user: deleted[0] });
});

export default app;
