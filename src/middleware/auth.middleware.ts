import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { users } from "../models";
import db from "../config/db_connect";
import { eq } from "drizzle-orm";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
    if (!decoded) {
      res.status(401).json({ message: "Invalid Access Token" });
      return;
    }
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.user.id))
      .limit(1);
    if (!user.length) {
      res.status(401).json({ message: "Invalid Access Token" });
      return;
    }
    req.user = { userId: user[0].id, username: user[0].username, email: user[0].email, role: user[0].role };
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
    return;
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin privileges required' });
    return;
  }
  next();
};
