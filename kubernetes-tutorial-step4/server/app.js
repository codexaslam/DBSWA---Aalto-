import { Hono } from "hono";

const app = new Hono();

app.get("*", (c) => {
  const configMessage = Deno.env.get("MESSAGE") || "Hello";
  const secretMessage = Deno.env.get("SECRET_MESSAGE") || "world!";
  return c.json({ message: `${configMessage} ${secretMessage}` });
});

export default app;
