import { HotelSchema, RoomSchema } from "../schema/shema";
import { ApiErrorRespose, ErrorResponse, SuccessResponse } from "../utiles/errosresponse";
import { prisma } from "../../db";
import type { Request, Response } from "express";

export const createHotelController = async (req: Request, res: Response) => {
    const parsedData = HotelSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json(ErrorResponse("INVALID_REQUEST"));
    }

    if (parsedData.data.description && parsedData.data.description.length > 255) {
        return res.status(400).json(ErrorResponse("INVALID_REQUEST"));
    }

    try {
        const hotel = await prisma.hotel.create({
            data: {
                name: parsedData.data.name,
                description: parsedData.data.description,
                city: parsedData.data.city,
                country: parsedData.data.country,
                amenities: parsedData.data.amenities,
                owner: { connect: { id: req.user?.id } },
            },
            select: {
                id: true,
                name: true,
                description: true,
                city: true,
                country: true,
                amenities: true,
                owner_id: true,
                rating: true,
                total_reviews: true,
            },
        });

        if (!hotel) {
            return res.status(500).json(ErrorResponse("INTERNAL_SERVER_ERROR"));
        }

        return res.status(201).json(
            SuccessResponse({
                id: hotel.id,
                name: hotel.name,
                description: hotel.description,
                city: hotel.city,
                country: hotel.country,
                amenities: hotel.amenities,
                ownerId: hotel.owner_id,
                rating: Number(hotel.rating),
                totalReviews: hotel.total_reviews,
            })
        );
    } catch (error) {
        return res.status(500).json(ErrorResponse("INTERNAL_SERVER_ERROR"));
    }
};

export const createRoomController = async (req: Request, res: Response) => {
    const parsedData = RoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json(ErrorResponse("INVALID_REQUEST"));
    }
    const hotel_id = req.params.hotel_id as string;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const hotel = await tx.hotel.findUnique({ where: { id: hotel_id } });
            if (!hotel) {
                throw new ApiErrorRespose("HOTEL_NOT_FOUND", 404);
            }
            if (hotel.owner_id !== req.user?.id) {
                throw new ApiErrorRespose("FORBIDDEN", 403);
            }

            const existingRoom = await tx.rooms.findUnique({
                where: {
                    hotel_id_room_number: {
                        hotel_id: hotel_id,
                        room_number: parsedData.data.roomNumber,
                    },
                },
            });
            if (existingRoom) {
                throw new ApiErrorRespose("ROOM_ALREADY_EXISTS", 400);
            }

            const room = await tx.rooms.create({
                data: {
                    hotel_id: hotel_id,
                    room_number: parsedData.data.roomNumber,
                    room_type: parsedData.data.roomType,
                    price_per_night: parsedData.data.pricePerNight,
                    max_occupancy: parsedData.data.maxOccupancy,
                },
                select: {
                    id: true,
                    room_number: true,
                    room_type: true,
                    price_per_night: true,
                    max_occupancy: true,
                    hotel_id: true,
                },
            });

            return room;
        });

        return res.status(201).json(
            SuccessResponse({
                id: result.id,
                hotelId: result.hotel_id,
                roomNumber: result.room_number,
                roomType: result.room_type,
                pricePerNight: Number(result.price_per_night),
                maxOccupancy: result.max_occupancy,
            })
        );
    } catch (error: any) {
        if (error instanceof ApiErrorRespose) {
            return res.status(error.statusCode).json(ErrorResponse(error.message));
        }
        return res.status(500).json(ErrorResponse("INTERNAL_SERVER_ERROR"));
    }
};

export const serachHotelController = async (req: Request, res: Response) => {
    const { city, country, minPrice, maxPrice, minRating } = req.query;
    const where: any = {};

    if (city) {
        where.city = { contains: city as string, mode: "insensitive" };
    }
    if (country) {
        where.country = { contains: country as string, mode: "insensitive" };
    }
    if (minRating) {
        where.rating = { gte: parseFloat(minRating as string) };
    }
    if (minPrice || maxPrice) {
        where.rooms = {
            some: {
                price_per_night: {
                    ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
                    ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
                },
            },
        };
    }

    const hotels = await prisma.hotel.findMany({
        where,
        select: {
            id: true,
            name: true,
            description: true,
            city: true,
            country: true,
            amenities: true,
            rating: true,
            total_reviews: true,
            owner_id: true,
            owner: { select: { id: true, name: true, email: true } },
            rooms: {
                select: {
                    id: true,
                    room_number: true,
                    room_type: true,
                    price_per_night: true,
                    max_occupancy: true,
                },
            },
        },
    });

    if (!hotels) {
        return res.status(500).json(ErrorResponse("INTERNAL_SERVER_ERROR"));
    }

    const minPriceNum = minPrice ? parseFloat(minPrice as string) : null;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : null;

    const formatted = hotels
        .map((h) => {

            let filteredRooms = h.rooms;
            if (minPriceNum !== null || maxPriceNum !== null) {
                filteredRooms = h.rooms.filter((r) => {
                    const price = Number(r.price_per_night);
                    if (minPriceNum !== null && price < minPriceNum) return false;
                    if (maxPriceNum !== null && price > maxPriceNum) return false;
                    return true;
                });
            }

            const roomPrices = filteredRooms.map((r) => Number(r.price_per_night));
            const minPricePerNight = roomPrices.length > 0 ? Math.min(...roomPrices) : null;

            return {
                id: h.id,
                name: h.name,
                description: h.description,
                city: h.city,
                country: h.country,
                amenities: h.amenities,
                ownerId: h.owner_id,
                rating: Number(h.rating),
                totalReviews: h.total_reviews,
                minPricePerNight,
                rooms: h.rooms.map((r) => ({
                    id: r.id,
                    roomNumber: r.room_number,
                    roomType: r.room_type,
                    pricePerNight: Number(r.price_per_night),
                    maxOccupancy: r.max_occupancy,
                })),
            };
        })
        .filter((h) => {

            if ((minPriceNum !== null || maxPriceNum !== null) && h.minPricePerNight === null) {
                return false;
            }
            return true;
        });

    return res.status(200).json(SuccessResponse(formatted));
};

export const hotelInfoWithRoomController = async (req: Request, res: Response) => {
    const hotelId = req.params.hotelId as string;

    const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
        select: {
            id: true,
            name: true,
            description: true,
            city: true,
            country: true,
            amenities: true,
            rating: true,
            total_reviews: true,
            owner_id: true,
            owner: { select: { id: true, name: true, email: true } },
            rooms: {
                select: {
                    id: true,
                    room_number: true,
                    room_type: true,
                    price_per_night: true,
                    max_occupancy: true,
                },
            },
        },
    });

    if (!hotel) {
        return res.status(404).json(ErrorResponse("HOTEL_NOT_FOUND"));
    }

    return res.status(200).json(
        SuccessResponse({
            id: hotel.id,
            name: hotel.name,
            description: hotel.description,
            city: hotel.city,
            country: hotel.country,
            amenities: hotel.amenities,
            ownerId: hotel.owner_id,
            rating: Number(hotel.rating),
            totalReviews: hotel.total_reviews,
            rooms: hotel.rooms.map((r) => ({
                id: r.id,
                roomNumber: r.room_number,
                roomType: r.room_type,
                pricePerNight: Number(r.price_per_night),
                maxOccupancy: r.max_occupancy,
            })),
        })
    );
};