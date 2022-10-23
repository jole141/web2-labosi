import express from "express";
import {
  getMatches,
  postMatch,
  putMatch,
  putMatchFinished,
} from "../datasource";
import { checkJwt } from "../middleware/check-jwt.middleware";
import { checkPermissions } from "../middleware/check-permissions.middleware";

export const matchController = express.Router();

matchController.get("/matches", async (req, res) => {
  const matches = await getMatches();
  res.status(200).json(matches);
});

matchController.put(
  "/matches/:id",
  checkJwt,
  checkPermissions,
  async (req, res) => {
    const { id } = req.params;
    const match = await putMatch(
      parseInt(id, 10),
      req.body.score0,
      req.body.score1
    );
    res.status(200).json(match);
  }
);

matchController.post(
  "/matches",
  checkJwt,
  checkPermissions,
  async (req, res) => {
    const match = await postMatch(
      req.body.fc0Id,
      req.body.fc1Id,
      req.body.fc0Score,
      req.body.fc1Score,
      req.body.date
    );
    res.status(200).json(match);
  }
);

matchController.patch(
  "/matches/finished/:id",
  checkJwt,
  checkPermissions,
  async (req, res) => {
    const { id } = req.params;
    const match = await putMatchFinished(parseInt(id, 10));
    res.status(200).json(match);
  }
);
