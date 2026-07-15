import cors from "cors";
import express from "express";
import morgan from "morgan";
import { debugRouter } from "./routes/debug";
import { healthRouter } from "./routes/health";
import { tiemposRouter } from "./routes/tiempos";

export const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use("/api", tiemposRouter);
app.use("/api", debugRouter);
app.use("/", healthRouter);
