import { Hono } from "hono";

interface Env {
  // Bindings do Cloudflare (ex.: env.DB, env.SECRET) quando usar Workers
}

const app = new Hono<{ Bindings: Env }>();

export default app;
