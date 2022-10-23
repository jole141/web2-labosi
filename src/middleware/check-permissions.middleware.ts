import { Request, Response, NextFunction } from "express";
import { ADMIN_PERMISSIONS } from "../premissions";
import { getJWTInfo } from "../helpers/getJWTInfo";

export const checkPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await getJWTInfo(req);
  if (!ADMIN_PERMISSIONS.includes(user.name)) {
    res.status(403).json({ message: "Forbidden" });
  }
  next();
};
