import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { getComments } from "./src/datasource";

dotenv.config();

const server: Express = express();

server.get("/", (req: Request, res: Response) => {
  res.send("TEST");
});

server.get("/comments", async (req: Request, res: Response) => {
  const comments = await getComments();
  res.json(comments);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server listening on http://localhost:" + PORT);
});
