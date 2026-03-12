import { Redis } from "ioredis";
import postgres from "postgres";

const sql = postgres();

// Consumer uses 'redis' hostname as per compose config
const redisConsumer = new Redis(6379, "redis");

const QUEUE_NAME = "users";

const consume = async () => {
  console.log("Consumer started, waiting for messages...");
  while (true) {
    try {
      const result = await redisConsumer.brpop(QUEUE_NAME, 0);
      if (result) {
        const [queue, user] = result;
        const parsedUser = JSON.parse(user);
        console.log(`Consuming user: ${parsedUser.name}`);
        await sql`INSERT INTO users (name) VALUES (${parsedUser.name})`;
      }
    } catch (e) {
      console.error("Error consuming message", e);
      // Wait a bit before retrying to avoid tight loop on error
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

consume();
