import express from "express";
import {
  deleteComment,
  getComments,
  postComment,
  putComment,
} from "../datasource";
import { checkJwt } from "../middleware/check-jwt.middleware";
import { getJWTInfo } from "../helpers/getJWTInfo";
import { checkCommentPermissions } from "../middleware/comment-permission.middleware";
import { checkPermissions } from "../middleware/check-permissions.middleware";

export const commentController = express.Router();

commentController.get("/comments/:matchId", async (req, res) => {
  const { matchId } = req.params;
  console.log(matchId);
  const comments = await getComments(parseInt(matchId, 10));
  res.status(200).json(comments);
});

commentController.post("/comments", checkJwt, async (req, res) => {
  const user = await getJWTInfo(req);
  const comment = await postComment(
    req.body.comment,
    req.body.matchId,
    user.name
  );
  res.status(200).json(comment);
});

commentController.put(
  "/comments/edit/:id",
  checkJwt,
  checkCommentPermissions,
  async (req, res) => {
    const comment = await putComment(
      parseInt(req.params.id, 10),
      req.body.comment
    );
    res.status(200).json(comment);
  }
);

commentController.delete(
  "/comments/:id",
  checkJwt,
  checkCommentPermissions,
  async (req, res) => {
    const { id } = req.params;
    const comment = await deleteComment(parseInt(id, 10));
    res.status(200).json(comment);
  }
);

commentController.delete(
  "/comments/admin/:id",
  checkJwt,
  checkPermissions,
  async (req, res) => {
    const { id } = req.params;
    const comment = await deleteComment(parseInt(id, 10));
    res.status(200).json(comment);
  }
);
