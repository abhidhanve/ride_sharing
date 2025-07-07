import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "../../../drizzle",
  dialect: "postgresql", // ✅ NEW FIELD instead of 'driver'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
