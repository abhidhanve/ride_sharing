import * as t from "drizzle-orm/pg-core";
import { users } from "./user";

export const driverAvailability = t.pgTable(
  "driver_availability",
  {
    driverId: t.integer("driver_id").primaryKey().references(() => users.id),
    isAvailable: t.boolean("is_available").default(false),
    lastLocationTime: t.timestamp("last_location_time").defaultNow(),
  },
  (table) => [
    t.index("driver_available_idx").on(table.isAvailable),
  ]
);
