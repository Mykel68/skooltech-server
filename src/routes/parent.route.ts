import { Router } from "express";
import {
  getLinkedChildren,
  linkChildToParent,
} from "../controllers/parent.controller";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
  verify_X_API_KEY,
} from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/link-child",
  verify_X_API_KEY,
  authMiddleware,
  authorize(["Parent"]),
  restrictToSchool(),
  linkChildToParent
);

router.get(
  "/get-linked-children",
  verify_X_API_KEY,
  authMiddleware,
  authorize(["Parent"]),
  restrictToSchool(),
  getLinkedChildren
);

export default router;
