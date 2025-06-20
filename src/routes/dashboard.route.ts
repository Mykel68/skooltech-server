import { Router } from "express";
import { getDashboardStatsHandler } from "../controllers/dashboard.controller";
import {
  attachCurrentSessionTerm,
  authMiddleware,
  authorize,
  restrictToSchool,
  verify_X_API_KEY,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/test", (req, res) => {
  res.send("Dashboard test works!");
});

router.get(
  "/:school_id/stats",
  verify_X_API_KEY,
  authMiddleware,
  attachCurrentSessionTerm,
  authorize(["Admin"]),
  restrictToSchool(),
  getDashboardStatsHandler
);

export default router;
