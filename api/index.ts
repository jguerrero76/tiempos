// Vercel Serverless Function entry point
import { handle } from "hono/vercel";
import app from "../src/index";

export default handle(app);
