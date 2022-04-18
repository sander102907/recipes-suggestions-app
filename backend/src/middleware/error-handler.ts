import {
    Response,
    Request,
    NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";
import { ValidateError } from "tsoa";

export default function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
): Response | void {
    if (err instanceof ValidateError) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
            message: "Validation Failed",
            details: err.fields,
        });
    }
    if (err instanceof Error) {
        console.log(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error",
        });
    }

    next();
}