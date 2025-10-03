import jwt from "jsonwebtoken";
import { ObjectId, Db } from "mongodb";
import { Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

export const getUser = async (req: Request, db: Db) => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }

  const token = header.replace("Bearer ", "");
  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return null;
    }

    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) });
    return user;
  } catch (err) {
    // Invalid token, expired token, etc.
    return null;
  }
};