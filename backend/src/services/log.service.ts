import prisma from '../client';

export class LogService {
    static getCronjobsLogs(take = 300, page = 0, fromTime: Date | undefined = undefined) {
        return prisma.logsCronjobs.findMany({
            skip: take * page,
            take: take,
            orderBy: {
                timestamp: 'desc'
            },            
            where: {
                timestamp: {
                    gte: fromTime
                }
            }
        })
    }
}