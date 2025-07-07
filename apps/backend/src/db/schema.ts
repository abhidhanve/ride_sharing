import { pgTable, serial, varchar,integer,timestamp, decimal , numeric, doublePrecision, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 100 }).unique(),
  phone: varchar('phone', { length: 20 }),
  userType: varchar('user_type', { length: 10 }), // 'rider' | 'driver'
  rating: numeric('rating', { precision: 3, scale: 2 }).default('5.0'),
  currentLat: doublePrecision('current_lat'),
  currentLng: doublePrecision('current_lng'),
  isActive: boolean('is_active').default(true),
});


export const rides = pgTable('rides', {
  rideId: serial('ride_id').primaryKey(),
  riderId: integer('rider_id').references(() => users.userId),
  driverId: integer('driver_id').references(() => users.userId),
  requestTime: timestamp('request_time').defaultNow(),
  pickupTime: timestamp('pickup_time'),
  dropoffTime: timestamp('dropoff_time'),
  pickupLat: doublePrecision('pickup_lat'),
  pickupLng: doublePrecision('pickup_lng'),
  dropLat: doublePrecision('drop_lat'),
  dropLng: doublePrecision('drop_lng'),
  distanceKm: decimal('distance_km', { precision: 5, scale: 2 }),
  baseFare: decimal('base_fare', { precision: 10, scale: 2 }),
  surgeMultiplier: decimal('surge_multiplier', { precision: 3, scale: 2 }),
  totalFare: decimal('total_fare', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 20 }), // requested, accepted, completed, cancelled
});
