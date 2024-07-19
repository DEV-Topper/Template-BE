import { config } from "dotenv";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
config();

export const isAuthenticated = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Access denied, no token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (ex: any) {
    res.status(400).json({ error: "Invalid token", err: ex.message });
  }
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req?.user?.role! !== "admin")
    return res.status(403).json({ error: "Access denied" });
  next();
};
