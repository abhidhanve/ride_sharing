import { Hono } from "hono";
import db from "../lib/db";
import { rides } from "../lib/db/schema/ride";
import { driverAvailability } from "../lib/db/schema/driverAvailability";
import type { InsertRide } from "../lib/db/schema/ride";
import { eq } from "drizzle-orm";

const app = new Hono();

app.post("/", async (c) => {
  const baseFare = 30;
  const requestHour = new Date().getHours();
  const surgeMultiplier = requestHour >= 17 && requestHour <= 20 ? 1.5 : 1.0;
  const totalFare = baseFare * surgeMultiplier;

  const body = await c.req.json();

  if (!body.riderId || !body.driverId || !body.pickupLat || !body.pickupLng || !body.dropLat || !body.dropLng) {
    return c.text("Missing required fields", 400);
  }

  const insertData: InsertRide = {
    riderId: body.riderId,
    driverId: body.driverId,
    pickupLat: body.pickupLat,
    pickupLng: body.pickupLng,
    dropLat: body.dropLat,
    dropLng: body.dropLng,
    distanceKm: body.distanceKm,
    baseFare: baseFare.toString(),
    surgeMultiplier: surgeMultiplier.toString(),
    totalFare: totalFare.toString(),
    status: "requested",
  };
  const result = await db.insert(rides).values(insertData);

  return c.json({ message: "Ride requested", result });
});

app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await db.query.rides.findFirst({
    where: (ride, { eq }) => eq(ride.id, id),
  });

  if (!result) return c.text("Ride not found", 404);
  return c.json(result);
});

// 🔸 PUT /api/ride/:id/status - Update ride status
app.put("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const status = body.status;

  if (!["requested", "accepted", "completed", "cancelled"].includes(status)) {
    return c.text("Invalid status", 400);
  }

  // 1. Update ride status
  const rideResult = await db.update(rides).set({ status }).where(eq(rides.id, id)).returning();

  const updatedRide = rideResult[0];
  if (!updatedRide) return c.text("Ride not found", 404);



  // 2. If completed or cancelled → mark driver available again
  if (status === "completed" || status === "cancelled") {
    if(!updatedRide.driverId) {
      return c.text("Driver ID not found for this ride", 400);
    }

    if( driverAvailability === undefined) {
      return c.text("Driver availability schema not found", 500);
    }

    await db.update(driverAvailability)
      .set({ isAvailable: true })
      .where(eq(driverAvailability.driverId, updatedRide.driverId));
  }

  return c.json({ message: "Status updated", ride: updatedRide });
});


app.get("/", async (c) => {
  const result = await db.select().from(rides);
  return c.json(result);
});


app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const result = await db.update(rides).set({
    riderId: body.riderId,
    driverId: body.driverId,
    pickupLat: body.pickupLat,
    pickupLng: body.pickupLng,
    dropLat: body.dropLat,
    dropLng: body.dropLng,
    distanceKm: body.distanceKm,
    baseFare: body.baseFare,
    surgeMultiplier: body.surgeMultiplier,
    totalFare: body.totalFare,
    status: body.status,
  }).where(eq(rides.id, id));

  return c.json({ message: "Ride updated", result });
});

app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const result = await db.delete(rides).where(eq(rides.id, id));
  return c.json({ message: "Ride deleted", result });
});


export default app;
