import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Next.js development can cause multiple PrismaClient instances to be created
const prismaClientSingleton = () => {
    const databaseUrl = process.env.DATABASE_URL || "";
    // Robustly append parameters
    const separator = databaseUrl.includes('?') ? '&' : '?';
    // Neon Free Tier has a strict 10 connection limit. 
    // We set Web to 5 and Bot to 3 to stay under the cap.
    const finalUrl = `${databaseUrl}${separator}connect_timeout=60&pool_timeout=60&connection_limit=5`;

    return new PrismaClient({
        datasources: {
            db: {
                url: finalUrl,
            },
        },
    });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
