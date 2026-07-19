// Vercel Serverless Function entry point
// Hono es compatible con Vercel exportando app.fetch como handler
import app from "../src/index";

// Vercel soporta el handler fetch (Request => Response) con Node.js runtime
export default app.fetch;