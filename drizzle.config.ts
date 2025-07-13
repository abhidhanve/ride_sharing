// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config(); 

export default defineConfig({
  out: "./drizzle",
  schema: "./api/lib/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URI!,
  },
  casing: "snake_case",
});
