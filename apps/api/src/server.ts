import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { getTeamStats, updateTeamStats } from "./controllers/teamController";
export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/teams/get-stats", getTeamStats)
    .patch("/teams/update-stats", updateTeamStats);

  return app;
};
