import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import nocache from "nocache";
import { errorHandler } from "./src/middleware/error.middleware";
import { footballClubController } from "./src/controllers/football-club.router";
import { commentController } from "./src/controllers/comments.router";
import { matchController } from "./src/controllers/match.router";

dotenv.config();

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN_URL = process.env.CLIENT_ORIGIN_URL;

const server: Express = express();

server.use(express.json());
server.set("json spaces", 2);
server.use((req, res, next) => {
  res.contentType("application/json; charset=utf-8");
  next();
});
server.use(nocache());
server.use(
  cors({
    origin: CLIENT_ORIGIN_URL,
    methods: ["GET"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 86400,
  })
);

server.use(footballClubController);
server.use(matchController);
server.use(commentController);

server.use(errorHandler);

server.listen(PORT, () => {
  console.log("Server listening on http://localhost:" + PORT);
});
