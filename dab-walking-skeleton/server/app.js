import { Hono } from "hono";
import { Redis } from "ioredis";

// Do not modify these
const REDIS_CONTAINER_NAME = Deno.env.get("REDIS_HOST");
const REDIS_CONTAINER_PORT = Deno.env.get("REDIS_PORT");
const QUEUE_NAME = "PING_QUEUE";

const redis = new Redis(
  Number.parseInt(REDIS_CONTAINER_PORT),
  REDIS_CONTAINER_NAME,
);

const app = new Hono();

// Add the expected routes here
app.post("/ping", async (c) => {
  await redis.lpush(QUEUE_NAME, "ping");
  return c.text("pong");
});

app.get("/pong", async (c) => {
  const count = await redis.llen(QUEUE_NAME);
  if (count === 0) {
    return c.text("Queue empty");
  }
  const message = await redis.rpop(QUEUE_NAME);
  // Handle theoretical race where queue became empty between checks
  if (!message) {
    return c.text("Queue empty");
  }
  return c.text(message);
});

export default app;
