import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const recipes = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/recipes" }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { recipes };
