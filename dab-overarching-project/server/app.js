import { Hono } from "hono";
import { cache } from "hono/cache";
import { Redis } from "ioredis";
import postgres from "postgres";

const app = new Hono();

let redis;
if (Deno.env.get("REDIS_HOST")) {
  redis = new Redis(
    Number.parseInt(Deno.env.get("REDIS_PORT")),
    Deno.env.get("REDIS_HOST"),
  );
} else {
  redis = new Redis(6379, "redis");
}

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

app.post("/api/exercises/:id/submissions", async (c) => {
  const idParam = c.req.param("id");
  const exerciseId = Number(idParam);
  if (!idParam || isNaN(exerciseId)) {
    return c.json({ error: "Invalid exercise ID" }, 400);
  }

  const { source_code } = await c.req.json();
  if (!source_code) {
    return c.json({ error: "Missing source_code" }, 400);
  }

  const [submission] =
    await sql`INSERT INTO exercise_submissions (exercise_id, source_code)
    VALUES (${exerciseId}, ${source_code})
    RETURNING id`;

  await redis.lpush("submissions", submission.id);

  return c.json({ id: submission.id });
});

export default app;
