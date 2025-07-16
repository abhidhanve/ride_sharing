import { Hono } from "hono";
import db from "../lib/db";
import { users } from "../lib/db/schema/user";
import { driverAvailability } from "../lib/db/schema/driverAvailability";
import { rides } from "../lib/db/schema/ride";
import { eq, and } from "drizzle-orm";
import { calculateDistanceKm } from "../utils/haversine";
import { z } from "zod";
import type { InsertRide } from "../lib/db/schema/ride";

const app = new Hono();

const assignSchema = z.object({
  riderId: z.number(),
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropLat: z.number(),
  dropLng: z.number(),
  distanceKm: z.number(),
});

app.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = assignSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error }, 400);
  }

  const { riderId, pickupLat, pickupLng, dropLat, dropLng, distanceKm } =
    parsed.data;

  // 1. Find nearest available driver
  const drivers = await db
    .select({
      id: users.id,
      name: users.name,
      lat: users.currentLat,
      lng: users.currentLng,
    })
    .from(users)
    .innerJoin(driverAvailability, eq(users.id, driverAvailability.driverId))
    .where(
      and(
        eq(users.userType, "driver"),
        eq(users.isActive, true),
        eq(driverAvailability.isAvailable, true)
      )
    );

  if (!drivers.length) {
    return c.json({ error: "No available drivers found" }, 404);
  }

  const sortedDrivers = drivers
    .map((d) => ({
      ...d,
      distanceKm: calculateDistanceKm(
        pickupLat,
        pickupLng,
        d.lat ?? 0,
        d.lng ?? 0
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const assignedDriver = sortedDrivers[0];

  if (!assignedDriver || assignedDriver.id === undefined) {
    return c.json({ error: "Could not assign driver" }, 500);
  }

  // 2. Calculate fare
  const baseFare = 30;
  const requestHour = new Date().getHours();
  const surgeMultiplier = requestHour >= 17 && requestHour <= 20 ? 1.5 : 1.0;
  const totalFare = baseFare * surgeMultiplier;

  const rideData: InsertRide = {
    riderId,
    driverId: assignedDriver.id,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
    distanceKm,
    baseFare: baseFare.toString(),
    surgeMultiplier: surgeMultiplier.toString(),
    totalFare: totalFare.toString(),
    status: "requested",
  };

  // 3. Create ride
  const ride = await db.insert(rides).values(rideData).returning();

  // 4. Mark driver unavailable
  await db
    .update(driverAvailability)
    .set({ isAvailable: false })
    .where(eq(driverAvailability.driverId, assignedDriver.id));

  return c.json({
    message: "Ride created and driver assigned",
    ride: ride[0],
    driver: assignedDriver,
  });
});

export default app;
