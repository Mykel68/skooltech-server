import { Router } from "express";
import * as userController from "../controllers/role.controller";

const router = Router();

router.get("/:id", userController.getUser);
router.post("/:id/roles", userController.addRole);
router.delete("/:id/roles", userController.deleteRole);

export default router;
