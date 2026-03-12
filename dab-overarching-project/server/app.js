import { Hono } from "hono";
import { cache } from "hono/cache";
import postgres from "postgres";

const app = new Hono();

const sql = postgres({
  host: Deno.env.get("POSTGRES_HOST") || "database",
  port: 5432,
  user: Deno.env.get("POSTGRES_USER"),
  password: Deno.env.get("POSTGRES_PASSWORD"),
  database: Deno.env.get("POSTGRES_DB"),
});

app.onError((err, c) => {
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

app.get(
  "/api/languages",
  cache({ cacheName: "languages", wait: true, cacheControl: "max-age=60" }),
  async (c) => {
    const languages = await sql`SELECT * FROM languages`;
    return c.json(languages);
  },
);

app.get(
  "/api/languages/:id/exercises",
  cache({ cacheName: "exercises", wait: true, cacheControl: "max-age=60" }),
  async (c) => {
    const idParam = c.req.param("id");
    const id = Number(idParam);
    if (!idParam || isNaN(id)) {
      return c.json([]);
    }

    const exercises =
      await sql`SELECT id, title, description FROM exercises WHERE language_id = ${idParam}`;
    return c.json(exercises);
  },
);

export default app;
