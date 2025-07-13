import { drizzle } from "drizzle-orm/bun-sql";
import { schema} from "./schema";
import env from "../../../env";

const client = new Bun.SQL(env.DB_URI);

const db = drizzle<typeof schema>(client, {
  schema,
  casing: "snake_case",
});

export default db;
