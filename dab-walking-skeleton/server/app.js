import { Hono } from "hono";
import { Redis } from "ioredis";

const app = new Hono();

// Redis connection - using values from environment or defaults
const REDIS_HOST = Deno.env.get("REDIS_HOST") || "redis";
const REDIS_PORT = Deno.env.get("REDIS_PORT") || 6379;

const redisProducer = new Redis(Number(REDIS_PORT), REDIS_HOST);

const QUEUE_NAME = "users";
const PING_QUEUE_NAME = "PING_QUEUE";

app.post("/users", async (c) => {
  const { name } = await c.req.json();
  await redisProducer.lpush(QUEUE_NAME, JSON.stringify({ name }));
  c.status(202);
  return c.body("Accepted");
});

app.post("/ping", async (c) => {
  await redisProducer.lpush(PING_QUEUE_NAME, "ping");
  return c.text("pong");
});

app.get("/pong", async (c) => {
  const count = await redisProducer.llen(PING_QUEUE_NAME);
  if (count === 0) {
    return c.text("Queue empty");
  }
  const message = await redisProducer.rpop(PING_QUEUE_NAME);
  if (!message) {
    return c.text("Queue empty");
  }
  return c.text(message);
});

export default app;
