import prisma from '../../client'
import app from "../../app";
import { StatusCodes } from "http-status-codes";
import { agent as request } from "supertest";
import path from 'path';
// import fs from "fs";

export const agent = request(app);

const invalidFilePaths = [
    undefined,
    path.join(__dirname, '..', 'data', 'test_file.json'),
    path.join(__dirname, '..', 'data', 'test_file.txt'),
    path.join(__dirname, '..', 'data', 'test_file.rar')
];

const validFilePaths = [
    path.join(__dirname, '..', 'data', 'test_image.png'),
    path.join(__dirname, '..', 'data', 'test_image.jpg'),
    path.join(__dirname, '..', 'data', 'test_image.jpeg')
];


afterAll(async () => {
    await prisma.file.deleteMany()
    await prisma.$disconnect()
})

describe('get a file', () => {
    it('should return ok status and the file with the corresponding ID', async () => {
        const file = await prisma.file.create({
            data: {
                path: path.join(__dirname, '..', 'data', 'test_image.png'),
                mimetype: "test mime type",
                createdAt: new Date(),
                size: 42
            }
        });

        await agent
            .get(`/files/${file?.id}`)
            .expect(StatusCodes.OK)
    })

    it('should send status NOT FOUND if no file with ID is found', async () => {
        var response = await agent
            .get('/files/-1')
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No file with ID -1 exists in the database` })
    })
})

describe('upload a image', () => {
    describe('should return unprocessable entity for non-images', () => {
        it.each<any | jest.DoneCallback>(invalidFilePaths)
            ("file path: %s", (filePath, done: jest.DoneCallback) => {
                agent
                    .post('/files/image')
                    .attach("file", filePath)
                    .expect(StatusCodes.UNPROCESSABLE_ENTITY, done)
            })
    })

    describe('should upload a image and return OK response status', () => {
        it.each<any | jest.DoneCallback>(validFilePaths)
            ("file path: %s", async filePath => {
                const before = new Date();

                const response = await agent
                    .post('/files/image')
                    .attach("file", filePath)
                    .expect(StatusCodes.OK);

                const images = await prisma.file.findMany({
                    where: {
                        createdAt: {
                            gt: before
                        }
                    }
                });

                expect(images.length).toBe(1);
                expect(response.body.mimetype).toContain("image");

                // fs.unlinkSync(response.body.path);
            })
    })
})