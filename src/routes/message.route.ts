import { Router } from "express";
import * as MessageController from "../controllers/message.controller";
import {
  attachCurrentSessionTerm,
  authMiddleware,
  authorize,
  restrictToSchool,
  verify_X_API_KEY,
} from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/:school_id",
  verify_X_API_KEY,
  authMiddleware,
  attachCurrentSessionTerm,
  authorize(["Admin"]),
  restrictToSchool(),
  MessageController.createMessage
);

router.get(
  "/:school_id",
  verify_X_API_KEY,
  authMiddleware,
  attachCurrentSessionTerm,
  authorize(["Admin"]),
  restrictToSchool(),
  MessageController.getSchoolMessages
);

router.get(
  "/:id",
  verify_X_API_KEY,
  authMiddleware,
  attachCurrentSessionTerm,
  restrictToSchool(),
  MessageController.getMessageById
);
router.post(
  "/:id/read",
  verify_X_API_KEY,
  authMiddleware,
  attachCurrentSessionTerm,
  restrictToSchool(),
  MessageController.markMessageAsRead
);

export default router;
