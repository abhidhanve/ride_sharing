// import * as t from "drizzle-orm/pg-core";
// import { timestamps } from "./helper";
// import { users } from "./user";

// export const rides = t.pgTable(
//   "rides",
//   {
//     id: t.serial("id").primaryKey(),
//     riderId: t.integer("rider_id").references(() => users.id),
//     driverId: t.integer("driver_id").references(() => users.id),
//     requestTime: t.timestamp("request_time").defaultNow(),
//     pickupTime: t.timestamp("pickup_time"),
//     dropoffTime: t.timestamp("dropoff_time"),
//     pickupLat: t.doublePrecision("pickup_lat"),
//     pickupLng: t.doublePrecision("pickup_lng"),
//     dropLat: t.doublePrecision("drop_lat"),
//     dropLng: t.doublePrecision("drop_lng"),
//     distanceKm: t.decimal("distance_km", { precision: 5, scale: 2 }),
//     baseFare: t.decimal("base_fare", { precision: 10, scale: 2 }),
//     surgeMultiplier: t.decimal("surge_multiplier", { precision: 3, scale: 2 }),
//     totalFare: t.decimal("total_fare", { precision: 10, scale: 2 }),
//     status: t.varchar("status", { length: 20 }).notNull(), // requested, accepted, completed, cancelled
//     ...timestamps,
//   },
//   (table) => [
//     t.index("rider_idx").on(table.riderId),
//     t.index("driver_idx").on(table.driverId),
//     t.index("status_idx").on(table.status),
//   ]
// );



import * as t from "drizzle-orm/pg-core";
import { users } from "./user";

export const rides = t.pgTable(
  "rides",
  {
    id: t.serial("id").primaryKey(),
    riderId: t.integer("rider_id").references(() => users.id),
    driverId: t.integer("driver_id").references(() => users.id),
    pickupLat: t.doublePrecision("pickup_lat"),
    pickupLng: t.doublePrecision("pickup_lng"),
    dropLat: t.doublePrecision("drop_lat"),
    dropLng: t.doublePrecision("drop_lng"),
    distanceKm: t.decimal("distance_km", { precision: 5, scale: 2 }),
    baseFare: t.decimal("base_fare", { precision: 10, scale: 2 }),
    surgeMultiplier: t.decimal("surge_multiplier", { precision: 3, scale: 2 }),
    totalFare: t.decimal("total_fare", { precision: 10, scale: 2 }),
    status: t.varchar("status", { length: 20 }).notNull(),
  }
);


export type InsertRide = typeof rides.$inferInsert;
