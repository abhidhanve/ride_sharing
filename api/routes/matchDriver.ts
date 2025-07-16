import { Hono } from "hono";
import db from "../lib/db";
import { users } from "../lib/db/schema/user";
import { driverAvailability } from "../lib/db/schema/driverAvailability";
import { and, eq } from "drizzle-orm";
import { calculateDistanceKm } from "../utils/haversine";
import { matchDriverSchema } from "../lib/validators/matchDriver.ts";
import type { MatchDriverInput } from "../lib/validators/matchDriver.ts";

const app = new Hono();

app.post("/", async (c) => {

  let parsed: MatchDriverInput;

  try {
    const body = await c.req.json();
    console.log("Match Driver Request Body:", body);
    parsed = matchDriverSchema.parse(body);

  } catch (err) {
    return c.json({ error: "Invalid input", details: err }, 400);
  }

  const { lat: riderLat, lng: riderLng } = parsed;

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

  const driversWithDistance = drivers
    .map((d) => ({
      ...d,
      distanceKm: calculateDistanceKm(riderLat, riderLng, d.lat ?? 0, d.lng ?? 0),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5);

  return c.json({ nearestDrivers: driversWithDistance });
});

export default app;
