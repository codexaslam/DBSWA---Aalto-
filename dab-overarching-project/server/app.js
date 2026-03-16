import { Hono } from "hono";
import { cache } from "hono/cache";
import { Redis } from "ioredis";
import postgres from "postgres";

import { auth } from "./auth.js";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use("/api/exercises/:id/submissions", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("user", session.user.id);
  return next();
});

app.use("/api/submissions/:id/status", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("user", session.user.id);
  return next();
});

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

app.get("/api/exercises/:id", async (c) => {
  const idParam = c.req.param("id");
  const id = Number(idParam);
  if (!idParam || isNaN(id)) {
    return new Response(null, { status: 404 });
  }

  const exercises =
    await sql`SELECT id, title, description FROM exercises WHERE id = ${id}`;
  if (exercises.length === 0) {
    return new Response(null, { status: 404 });
  }
  return c.json(exercises[0]);
});

app.get("/api/submissions/:id/status", async (c) => {
  const idParam = c.req.param("id");
  const id = Number(idParam);
  if (!idParam || isNaN(id)) {
    return new Response(null, { status: 404 });
  }

  const userId = c.get("user");

  const submissions =
    await sql`SELECT grading_status, grade, user_id FROM exercise_submissions WHERE id = ${id} AND user_id = ${userId}`;
  if (submissions.length === 0) {
    return new Response(null, { status: 404 });
  }
  return c.json({
    grading_status: submissions[0].grading_status,
    grade: submissions[0].grade,
  });
});

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

  const userId = c.get("user");

  const [submission] =
    await sql`INSERT INTO exercise_submissions (exercise_id, source_code, user_id)
    VALUES (${exerciseId}, ${source_code}, ${userId})
    RETURNING id`;

  await redis.lpush("submissions", submission.id);

  return c.json({ id: submission.id });
});

export default app;
