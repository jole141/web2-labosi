import express from "express";
import {
  createEmptyMatch,
  enterMatchResults,
  getMatchById,
  getMatches,
  getMatchesResults,
  updateMatchResults,
} from "../datasource";
import { checkJwt } from "../middleware/check-jwt.middleware";
import { checkPermissions } from "../middleware/check-permissions.middleware";

export const matchController = express.Router();

matchController.get("/matches", async (req, res) => {
  const matches = await getMatches();
  res.status(200).json(matches);
});

matchController.get("/matches/results", async (req, res) => {
  const matches = await getMatchesResults();
  res.status(200).json(matches);
});

matchController.get("/matches/:id", async (req, res) => {
  const match = await getMatchById(parseInt(req.params.id, 10));
  res.status(200).json(match);
});

matchController.post(
  "/matches",
  checkJwt,
  checkPermissions,
  async (req, res) => {
    const match = await createEmptyMatch(
      req.body.fc0Id,
      req.body.fc1Id,
      req.body.date
    );
    res.status(200).json(match);
  }
);

matchController.put(
  "/matches/results/:id",
  checkJwt,
  checkPermissions,
  async (req, res) => {
    const { id } = req.params;
    const match = await enterMatchResults(
      parseInt(id, 10),
      req.body.score0,
      req.body.score1
    );
    res.status(200).json(match);
  }
);

matchController.put(
  "/matches/results/update/:id",
  checkJwt,
  checkPermissions,
  async (req, res) => {
    const { id } = req.params;
    const match = await updateMatchResults(
      parseInt(id, 10),
      req.body.score0,
      req.body.score1
    );
    res.status(200).json(match);
  }
);
