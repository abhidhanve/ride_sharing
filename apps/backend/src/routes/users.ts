import { Hono } from 'hono';

// POST /users → Create user
app.post('/users', async (c) => {
  const body = await c.req.json();

  const newUser = await db.insert(users).values({
    name: body.name,
    email: body.email,
    phone: body.phone,
    userType: body.userType,
  }).returning();

  return c.json(newUser[0]);
});