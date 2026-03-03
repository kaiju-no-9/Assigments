import express from "express";
import authRouter from "./routes/aut.route";
import hotelRouter from "./routes/hotel.route";
import bookingRouter from "./routes/booking.route";
import reviewRouter from "./routes/review.route";

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
