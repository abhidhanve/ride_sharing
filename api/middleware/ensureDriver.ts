import type { MiddlewareHandler } from "hono";

export const ensureDriverOwnsAccount: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");
  const idParam = Number(c.req.param("id"));

  if (!user || user.userType !== "driver") {
    return c.json({ error: "Only drivers can perform this action." }, 403);
  }

  if (user.id !== idParam) {
    return c.json({ error: "Unauthorized: You can only manage your own availability." }, 403);
  }

  await next();
};
