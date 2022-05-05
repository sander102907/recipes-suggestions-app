import prisma from '../client';
import FileParams from '../interfaces/FileParams';

export class FileService {
    static getFile(id: number) {
        return prisma.file.findUnique({
            where: {
                id: id
            }
        });
    }

    static createFile(fileParams: FileParams) {
        return prisma.file.create({
            data: fileParams
        });
    }
}