import { NextFunction, Request, Response } from "express";
import { getJWTInfo } from "../helpers/getJWTInfo";
import { getCommentById } from "../datasource";

export const checkCommentPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await getJWTInfo(req);
  const { id } = req.params;
  const comment = await getCommentById(parseInt(id, 10));
  if (comment.user !== user.name) {
    res.status(403).json({ message: "Forbidden" });
  }
  next();
};
