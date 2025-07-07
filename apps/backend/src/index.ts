import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { users } from './db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';

import 'dotenv/config';

const app = new Hono();
app.use('*', logger());

// Connect to Railway PostgreSQL
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);


export default app;
