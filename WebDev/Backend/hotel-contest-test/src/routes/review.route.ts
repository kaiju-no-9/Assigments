import { Router } from "express";
import { submitReviews } from "../controllers/review.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const reviewRouter = Router();

reviewRouter.post("/", authMiddleware, submitReviews);

export default reviewRouter;
