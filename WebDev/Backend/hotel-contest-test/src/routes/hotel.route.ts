import { Router } from "express";
import {
    createHotelController,
    createRoomController,
    serachHotelController,
    hotelInfoWithRoomController,
} from "../controllers/hotel.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const hotelRouter = Router();

hotelRouter.post("/", authMiddleware, requireRole("owner"), createHotelController);
hotelRouter.get("/", authMiddleware, serachHotelController);
hotelRouter.get("/:hotelId", authMiddleware, hotelInfoWithRoomController);
hotelRouter.post("/:hotel_id/rooms", authMiddleware, requireRole("owner"), createRoomController);

export default hotelRouter;
