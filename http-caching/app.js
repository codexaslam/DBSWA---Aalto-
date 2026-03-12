import { Hono } from "@hono/hono";
import { cache } from "@hono/hono/cache";
import { etag } from "@hono/hono/etag";

const app = new Hono();

// Assignment:
// /todos/:id -> ETag header (but no Cache-Control header). 304 if If-None-Match matches.
app.get("/todos/:id", etag(), async (c) => {
  const id = c.req.param("id");
  return c.json({ todo: id });
});

// Assignment:
// /users/:id -> Cache-Control header max-age=10 (but no Etag header).
app.get(
  "/users/:id",
  cache({
    cacheName: "users",
    cacheControl: "max-age=10",
    wait: true, // robust setting
  }),
  async (c) => {
    const id = c.req.param("id");
    return c.json({ user: id });
  },
);

export default app;
