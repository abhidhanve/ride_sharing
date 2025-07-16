import { Hono } from "hono";
import db from "../lib/db";
import { driverAvailability } from "../lib/db/schema/driverAvailability";
import { eq } from "drizzle-orm";

const app = new Hono();

// ✅ Get all driver availability
app.get("/", async (c) => {
  const result = await db.select().from(driverAvailability);
  return c.json(result);
});

// ✅ Get one driver availability
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await db
    .select()
    .from(driverAvailability)
    .where(eq(driverAvailability.driverId, id));
  return result.length
    ? c.json(result[0])
    : c.json({ error: "Driver not found" }, 404);
});

// ✅ Insert availability (new driver)
app.post("/", async (c) => {
  const body = await c.req.json();
  const result = await db.insert(driverAvailability).values({
    driverId: body.driverId,
    isAvailable: body.isAvailable ?? true,
    lastLocationTime: new Date(),
  });
  return c.json({ message: "Driver availability set", result });
});

// ✅ Update availability (status or time)
app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const result = await db
    .update(driverAvailability)
    .set({
      isAvailable: body.isAvailable,
      lastLocationTime: body.lastLocationTime ?? new Date(),
    })
    .where(eq(driverAvailability.driverId, id));

  return c.json({ message: "Availability updated", result });
});

// ✅ Optional: Delete availability record
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await db
    .delete(driverAvailability)
    .where(eq(driverAvailability.driverId, id));
  return c.json({ message: "Driver availability deleted", result });
});


app.patch("/:id/toggle", async (c) => {
  const id = Number(c.req.param("id"));

  const current = await db.query.driverAvailability.findFirst({
    where: (d, { eq }) => eq(d.driverId, id),
  });

  if (!current) return c.text("Driver not found", 404);

  const newAvailability = !current.isAvailable;

  const result = await db.update(driverAvailability)
    .set({ isAvailable: newAvailability })
    .where(eq(driverAvailability.driverId, id));

  return c.json({ message: "Availability toggled", isAvailable: newAvailability });
});



export default app;
