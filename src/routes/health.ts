import { Hono } from "hono";
import { Env } from "../config.js";

export const healthRouter = new Hono<{ Bindings: Env }>();

healthRouter.get("/health", (c) => {
  return c.json({ status: "ok" });
});