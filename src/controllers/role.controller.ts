import { Request, Response } from "express";
import * as userService from "../services/role.service";
import { sendResponse } from "../utils/response.util";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserWithRoles(req.params.id);
    if (!user) {
      throw new Error("User not found");
    }
    sendResponse(res, 200, user);
  } catch (error) {
    throw new Error("Error fetching user");
  }
};

export const addRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.body;
    const { id } = req.params;
    await userService.assignRoleToUser(id, roleId);
    sendResponse(res, 200, { message: "Role added successfully" });
  } catch (error) {
    throw new Error("Error adding role");
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.body;
    const { id } = req.params;
    await userService.removeRoleFromUser(id, roleId);
    sendResponse(res, 200, { message: "Role removed successfully" });
  } catch (error) {
    throw new Error("Error removing role");
  }
};
