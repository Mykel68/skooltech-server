import { Router } from "express";
import { linkChildToParent } from "../controllers/parent.controller";
import {
  authMiddleware,
  authorize,
  restrictToSchool,
  verify_X_API_KEY,
} from "../middlewares/auth.middleware";

const router = Router();

// Auth middleware to ensure only logged-in parents can link
router.post(
  "/link-child",
  verify_X_API_KEY,
  authMiddleware,
  authorize(["Parent"]),
  restrictToSchool(),
  linkChildToParent
);

export default router;
