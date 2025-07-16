import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helper";

export const users = t.pgTable(
  "users",
  {
    id: t.serial("id").primaryKey(),
    privyId: t.varchar("privy_id", { length: 42 }).notNull(),
    name: t.varchar("name", { length: 100 }).notNull(),
    email: t.varchar("email", { length: 100 }).notNull(),
    phone: t.varchar("phone", { length: 20 }),
    userType: t.varchar("user_type", { length: 10 }).notNull(), // 'rider' or 'driver'
    rating: t.numeric("rating", { precision: 3, scale: 2 }).default("5.0"),
    currentLat: t.doublePrecision("current_lat"),
    currentLng: t.doublePrecision("current_lng"),
    isActive: t.boolean("is_active").default(true),
    ...timestamps,
  },
  (table) => [
    t.uniqueIndex("privy_id_idx").on(table.privyId),
    t.index("email_idx").on(table.email),
  ]
);


export type InsertUser = typeof users.$inferInsert;