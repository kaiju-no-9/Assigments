import { z } from "zod";

export const SignInSchema = z.object({
    name : z.string().trim().nonempty(),
    email : z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).nonempty(),
    password : z.string().trim().nonempty(),
    phone : z.string().trim().optional(),
    role : z.enum(['customer', 'owner']).default('customer'),

}).strict()

export const LoginSchema = z.object({
    email : z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).nonempty(),
    password : z.string().trim().nonempty(),

}).strict()

export const HotelSchema = z.object({
    name : z.string().trim().nonempty(),
    description : z.string().trim().optional(),
    city : z.string().trim().nonempty().regex(/^[a-zA-Z ]+$/),
    country : z.string().trim().nonempty().regex(/^[a-zA-Z ]+$/),
    // TRY OUT OPTIONAL IN THE FUTURE ...
 //["wifi", "pool", "gym", "parking", "restaurant"]
    amenities : z.array(z.string()).default([]),
    
}).strict()

export const RoomSchema = z.object({
   roomNumber : z.string().trim().nonempty(),
   roomType : z.string().trim().nonempty(),
   pricePerNight : z.number().min(0),
   maxOccupancy : z.number().min(0),
})

export const BookingSchema = z.object({
    roomId : z.string().trim().nonempty(),
    checkInDate : z.string().trim().nonempty(),
    checkOutDate : z.string().trim().nonempty(),
    guests : z.number().min(0),

}).strict()

export const ReviewSchema = z.object({
    bookingId : z.string().trim().nonempty(),
    rating : z.number().min(1).max(5),
    comment : z.string().trim().nonempty(),
}).strict()