import { Request, Response, NextFunction } from "express";
import { ADMIN_PERMISSIONS } from "../premissions";
import axios from "axios";

export const checkPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const tokenInfoResponse = await axios.get(
    `https://${process.env.AUTH0_DOMAIN}/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!ADMIN_PERMISSIONS.includes(tokenInfoResponse.data.name)) {
    res.status(403).json({ message: "Forbidden" });
  }
  next();
};
