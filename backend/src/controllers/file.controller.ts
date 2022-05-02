import { StatusCodes } from "http-status-codes";
import path from "path";
import fs from "fs";
import {
    Controller,
    Get,
    Path,
    Post,
    Res,
    Route,
    Tags,
    Request,
    TsoaResponse,
    UploadedFile
} from "tsoa";
import { FileService } from "../services/file.service";
import FileHelper from "../utils/fileHelper";
import { File } from "@prisma/client";

@Route("files")
@Tags("File")
export class FileController extends Controller {
    /**
     * retrieve a raw file
     * @summary retrieve a raw file
     * @param id The file's identifier
     */
    @Get("/{id}")
    public async getFile(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>,
        @Request() request: any
    ): Promise<any> {
        const image = await FileService.getFile(id);

        if (image) {
            const stream = fs.createReadStream(image.path);
            stream.pipe(request.res);
            await new Promise((resolve, _) => {
                stream.on("end", () => {
                    request.res.end();
                    resolve(null);
                });
            });
        } else {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No file with ID ${id} exists in the database` });
        }
    }

    /**
     * Upload a image
     * @summary Upload a image
     */
    @Post("image")
    public async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Res() invalidInputResponse: TsoaResponse<StatusCodes.UNPROCESSABLE_ENTITY, { reason: string }>
    ): Promise<File> {
        const filetypes = /jpeg|jpg|png/;

        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            const filePath = FileHelper.writeFile(path.join("uploads", "images", file.originalname), file.buffer);
            return await FileService.createFile({
                path: filePath,
                mimetype: file.mimetype,
                createdAt: new Date(),
                size: file.size
            });
        }

        return invalidInputResponse(StatusCodes.UNPROCESSABLE_ENTITY, { reason: "only images are allowed. " })
    }
}