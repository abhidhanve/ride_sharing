import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helper";
import { rides } from "./ride";

export const feedback = t.pgTable(
  "feedback",
  {
    id: t.serial("id").primaryKey(),
    rideId: t.integer("ride_id").references(() => rides.id),
    rating: t.integer("rating").notNull(), // 1 to 5
    comments: t.varchar("comments", { length: 255 }),
    ...timestamps,
  },
  (table) => [
    t.index("ride_idx").on(table.rideId),
    t.index("rating_idx").on(table.rating),
  ]
);
