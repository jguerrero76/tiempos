import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env } from "./config";
import { tiemposRouter } from "./routes/tiempos";
import { healthRouter } from "./routes/health";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());
app.route("/api", tiemposRouter);
app.route("/", healthRouter);

export default app;