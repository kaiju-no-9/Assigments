//code for db.ts program for handlnig databse connectio around prisma 

import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
adapter,
});