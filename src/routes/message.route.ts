import { Router } from "express";
import * as MessageController from "../controllers/message.controller";
import {
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
  authorize(["Admin"]),
  restrictToSchool(),
  MessageController.createMessage
);

router.get(
  "/:school_id",
  verify_X_API_KEY,
  authMiddleware,
  authorize(["Admin"]),
  restrictToSchool(),
  MessageController.getSchoolMessages
);

router.get(
  "/user/:school_id",
  verify_X_API_KEY,
  authMiddleware,
  restrictToSchool(),
  MessageController.getUserMessages
);

router.get(
  "/:id",
  verify_X_API_KEY,
  authMiddleware,
  restrictToSchool(),
  MessageController.getMessageById
);
router.post(
  "/:id/read",
  verify_X_API_KEY,
  authMiddleware,
  restrictToSchool(),
  MessageController.markMessageAsRead
);

export default router;
