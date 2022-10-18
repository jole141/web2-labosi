import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { getComments } from "./src/datasource";

dotenv.config();

const app: Express = express();
const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

app.get("/", (req: Request, res: Response) => {
  res.send("TEST");
});

app.get("/comments", async (req: Request, res: Response) => {
  const comments = await getComments();
  res.json(comments);
});

if (externalUrl) {
  const hostname = "127.0.0.1";
  app.listen(port, hostname, () => {
    console.log(
      `Server locally running at http://${hostname}:${port}/ and from outside on ${externalUrl}`
    );
  });
} else {
  app.listen(port, function () {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
