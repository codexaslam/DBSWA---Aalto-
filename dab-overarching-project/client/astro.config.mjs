import svelte from "@astrojs/svelte";
import deno from "@deno/astro-adapter";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: deno(),
  integrations: [svelte()],
});
