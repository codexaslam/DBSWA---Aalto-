import { Hono } from "hono";
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

let consume_enabled = false;

const gradeSubmission = async (submissionId) => {
  try {
    // Update status to processing
    await sql`
      UPDATE exercise_submissions
      SET grading_status = 'processing'
      WHERE id = ${submissionId}
    `;

    // Sleep for random time between 1 and 3 seconds
    const sleepTime = Math.floor(Math.random() * 2000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, sleepTime));

    // Generate random grade
    const grade = Math.floor(Math.random() * 101);

    // Update status to graded and set grade
    await sql`
      UPDATE exercise_submissions
      SET grading_status = 'graded', grade = ${grade}
      WHERE id = ${submissionId}
    `;
  } catch (e) {
    console.error(`Error grading submission ${submissionId}:`, e);
  }
};

const processQueue = async () => {
  while (consume_enabled) {
    try {
      const submissionId = await redis.rpop("submissions");
      if (submissionId) {
        await gradeSubmission(submissionId);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (e) {
      console.error("Error processing queue:", e);
      // specific error wait to avoid busy loop on error
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

app.get("/api/status", async (c) => {
  const queueSize = await redis.llen("submissions");
  return c.json({ queue_size: queueSize, consume_enabled });
});

app.post("/api/consume/enable", async (c) => {
  if (!consume_enabled) {
    consume_enabled = true;
    // Start processing in background, don't await it
    processQueue();
  }
  return c.json({ consume_enabled: true });
});

app.post("/api/consume/disable", async (c) => {
  consume_enabled = false;
  return c.json({ consume_enabled: false });
});

export default app;
