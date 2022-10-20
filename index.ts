import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { getComments } from "./src/datasource";
import cors from "cors";
import helmet from "helmet";
import nocache from "nocache";
import { checkJwt } from "./src/middleware/check-jwt.middleware";
import { errorHandler } from "./src/middleware/error.middleware";
import { checkPermissions } from "./src/middleware/check-permissions.middleware";

dotenv.config();

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN_URL = process.env.CLIENT_ORIGIN_URL;

const server: Express = express();
const serverRouter = express.Router();

server.use(express.json());
server.set("json spaces", 2);
server.use(
  helmet({
    hsts: {
      maxAge: 31536000,
    },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'none'"],
        "frame-ancestors": ["'none'"],
      },
    },
    frameguard: {
      action: "deny",
    },
  })
);
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

server.use("/api", serverRouter);

server.get("/", (req: Request, res: Response) => {
  res.status(200).send("TEST");
});

server.get("/comments", checkJwt, async (req: Request, res: Response) => {
  const comments = await getComments();
  res.status(200).json(comments);
});

server.get("/admin", checkJwt, checkPermissions, (req, res) => {
  res.status(200).json("THIS IS FOR ADMIN");
});

server.use(errorHandler);

server.listen(PORT, () => {
  console.log("Server listening on http://localhost:" + PORT);
});
