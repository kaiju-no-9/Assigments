import { Router } from "express";
import {
    createNewBookingController,
    GetBookingofCurrentUserController,
    cancelBooking,
} from "../controllers/booking.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const bookingRouter = Router();

bookingRouter.post("/", authMiddleware, requireRole("customer"), createNewBookingController);
bookingRouter.get("/", authMiddleware, GetBookingofCurrentUserController);
bookingRouter.put("/:bookingId/cancel", authMiddleware, cancelBooking);

export default bookingRouter;
