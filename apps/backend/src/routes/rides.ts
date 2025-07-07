import { rides } from '../db/schema';
import { eq } from 'drizzle-orm';


// POST /rides
app.post('/rides', async (c) => {
  const {
    riderId,
    driverId,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
    distanceKm,
  } = await c.req.json();

  // Pricing logic (simple version for now)
  const baseFare = 30; // flat base fare
  const surgeMultiplier = (new Date().getHours() >= 17 && new Date().getHours() <= 20) ? 1.5 : 1.0;
  const totalFare = baseFare * surgeMultiplier;

  const newRide = await db.insert(rides).values({
    riderId,
    driverId,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
    distanceKm,
    baseFare,
    surgeMultiplier,
    totalFare,
    status: 'requested',
  }).returning();

  return c.json(newRide[0]);
});
