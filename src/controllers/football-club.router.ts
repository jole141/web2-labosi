import express from "express";
import { getClubs } from "../datasource";

export const footballClubController = express.Router();

footballClubController.get("/clubs", async (req, res) => {
  const clubs = await getClubs();
  res.status(200).json(clubs);
});
