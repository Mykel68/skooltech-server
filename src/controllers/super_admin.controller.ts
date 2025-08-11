import { NextFunction, Request, Response } from "express";
import { createSuperAdmin } from "../services/super_admin.service";

export const createSuperAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const admin = await createSuperAdmin({ username, email, password });

    res.status(201).json({
      message: "Super admin created successfully",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};
