import { PrismaClient } from '@prisma/client';

export class ApplicationDatabase {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getRandomCorrelationByCategory(category: string) {
        const count = await this.prisma.assetCorrelations.count({
            where: {
                correlationStrength: category
            }
        });

        const randomSkip = Math.floor(Math.random() * count);

        const correlations = await this.prisma.assetCorrelations.findMany({
            where: {
                correlationStrength: category
            },
            skip: randomSkip,
            take: 1
        });

        return correlations[0] || null;
    }
}