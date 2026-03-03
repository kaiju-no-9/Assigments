import { BookingSchema } from "../schema/shema";
import { ApiErrorRespose, ErrorResponse, SuccessResponse } from "../utiles/errosresponse";
import { prisma } from "../../db";
import type { Request, Response } from "express";

export const createNewBookingController = async (req: Request, res: Response) => {
    const parsedData = BookingSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json(ErrorResponse("INVALID_REQUEST"));
    }

    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json(ErrorResponse("UNAUTHORIZED"));
    }

    const { roomId, checkInDate, checkOutDate, guests } = parsedData.data;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const room = await tx.rooms.findUnique({
                where: { id: roomId },
                include: { hotel: true },
            });

            if (!room) {
                throw new ApiErrorRespose("ROOM_NOT_FOUND", 404);
            }

            // prevent owner from booking their own hotel's rooms
            if (room.hotel.owner_id === userId) {
                throw new ApiErrorRespose("FORBIDDEN", 403);
            }

            const checkInDateObj = new Date(checkInDate);
            const checkOutDateObj = new Date(checkOutDate);

            if (checkInDateObj >= checkOutDateObj) {
                throw new ApiErrorRespose("INVALID_REQUEST", 400);
            }

            if (guests > room.max_occupancy) {
                throw new ApiErrorRespose("INVALID_CAPACITY", 400);
            }

            const existingBooking = await tx.booking.findMany({
                where: {
                    room_id: roomId,
                    status: "confirmed",
                },
                select: {
                    check_in_date: true,
                    check_out_date: true,
                },
            });

            const overlappingBooking = existingBooking.some((booking) => {
                return (
                    checkInDateObj < booking.check_out_date &&
                    checkOutDateObj > booking.check_in_date
                );
            });

            if (overlappingBooking) {
                throw new ApiErrorRespose("ROOM_NOT_AVAILABLE", 400);
            }

            // Past-date check last so other errors take priority
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (today > checkInDateObj) {
                throw new ApiErrorRespose("INVALID_DATES", 400);
            }

            const nights =
                (checkOutDateObj.getTime() - checkInDateObj.getTime()) /
                (1000 * 60 * 60 * 24);
            const totalPrice = nights * Number(room.price_per_night);

            const booking = await tx.booking.create({
                data: {
                    user_id: userId,
                    room_id: roomId,
                    hotel_id: room.hotel_id,
                    check_in_date: checkInDateObj,
                    check_out_date: checkOutDateObj,
                    total_price: totalPrice,
                    guests: guests,
                },
            });

            return booking;
        });

        return res.status(201).json(
            SuccessResponse({
                id: result.id,
                roomId: result.room_id,
                hotelId: result.hotel_id,
                checkInDate: result.check_in_date,
                checkOutDate: result.check_out_date,
                totalPrice: Number(result.total_price),
                guests: result.guests,
                status: result.status,
                bookingDate: result.booking_date,
            })
        );
    } catch (err: any) {
        if (err instanceof ApiErrorRespose) {
            return res.status(err.statusCode).json(ErrorResponse(err.message));
        }
        return res.status(500).json(ErrorResponse("SERVER_ERROR"));
    }
};

export const GetBookingofCurrentUserController = async (
    req: Request,
    res: Response
) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json(ErrorResponse("UNAUTHORIZED"));
    }

    const statusFilter = req.query.status as string | undefined;

    const where: any = { user_id: userId };
    if (statusFilter) {
        where.status = statusFilter;
    }

    const bookings = await prisma.booking.findMany({
        where,
        include: {
            room: {
                select: { room_number: true, room_type: true },
            },
            hotel: {
                select: { name: true },
            },
        },
        orderBy: {
            booking_date: "desc",
        },
    });

    const formattedBookings = bookings.map((b) => ({
        id: b.id,
        roomId: b.room_id,
        hotelId: b.hotel_id,
        hotelName: b.hotel.name,
        roomNumber: b.room.room_number,
        roomType: b.room.room_type,
        checkInDate: b.check_in_date,
        checkOutDate: b.check_out_date,
        totalPrice: Number(b.total_price),
        guests: b.guests,
        status: b.status,
        bookingDate: b.booking_date,
    }));

    return res.status(200).json(SuccessResponse(formattedBookings));
};

export const cancelBooking = async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId as string;
    const userId = req.user?.id as string;

    if (!userId) {
        return res.status(401).json(ErrorResponse("UNAUTHORIZED"));
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const availBooking = await tx.booking.findUnique({
                where: { id: bookingId },
            });

            if (!availBooking) {
                throw new ApiErrorRespose("BOOKING_NOT_FOUND", 404);
            }

            if (availBooking.user_id !== userId) {
                throw new ApiErrorRespose("FORBIDDEN", 403);
            }

            if (availBooking.status === "cancelled") {
                throw new ApiErrorRespose("ALREADY_CANCELLED", 400);
            }

            const now = new Date();
            const checkIn = new Date(availBooking.check_in_date);
            const hoursUntilCheckIn =
                (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursUntilCheckIn < 24) {
                throw new ApiErrorRespose("CANCELLATION_DEADLINE_PASSED", 400);
            }

            const updated = await tx.booking.update({
                where: { id: bookingId },
                data: { status: "cancelled", cancelled_at: new Date() },
                select: { id: true, status: true, cancelled_at: true },
            });

            return updated;
        });

        return res.status(200).json(
            SuccessResponse({
                id: result.id,
                status: result.status,
                cancelledAt: result.cancelled_at,
            })
        );
    } catch (error) {
        if (error instanceof ApiErrorRespose) {
            return res.status(error.statusCode).json(ErrorResponse(error.message));
        }
        return res.status(500).json(ErrorResponse("SERVER_ERROR"));
    }
};