// Vercel Serverless Function entry point
import { handle } from "hono/vercel";
import { inject } from "@vercel/analytics";
import app from "../src/index.js";

// Inject Vercel Web Analytics
inject();

export const fetch = handle(app);
