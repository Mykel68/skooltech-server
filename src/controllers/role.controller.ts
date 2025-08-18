import { Request, Response } from "express";
import * as userService from "../services/role.service";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserWithRoles(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

export const addRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.body;
    const { id } = req.params;
    await userService.assignRoleToUser(id, roleId);
    res.json({ message: "Role assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error assigning role", error });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.body;
    const { id } = req.params;
    await userService.removeRoleFromUser(id, roleId);
    res.json({ message: "Role removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing role", error });
  }
};
