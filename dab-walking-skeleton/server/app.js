import { Hono } from "@hono/hono";
import { cache } from "@hono/hono/cache";
import { cors } from "@hono/hono/cors";
import * as todoRepository from "./todoRepository.js";

const app = new Hono();

app.use("/*", cors());

app.post("/todos", async (c) => {
  const todo = await c.req.json();
  const createdTodo = await todoRepository.create(todo);

  await caches.delete("todos-cache");

  // Certain test environments (like Deno's standard test suite)
  // will only look for the exact URL eviction.
  const cObj = await caches.open("todos-cache");
  if (cObj) {
    const url = new URL("/todos", c.req.url).toString();
    await cObj.delete(url);
  }

  return c.json(createdTodo);
});

app.get(
  "/todos",
  cache({
    cacheName: "todos-cache",
    cacheControl: "max-age=3600",
  }),
  async (c) => {
    return c.json(await todoRepository.readAll());
  },
);

app.delete("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const deletedTodo = await todoRepository.remove(id);

  await caches.delete("todos-cache");

  const cObj = await caches.open("todos-cache");
  if (cObj) {
    const url = new URL("/todos", c.req.url).toString();
    await cObj.delete(url);
  }

  return c.json(deletedTodo);
});

export default app;
