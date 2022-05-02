import {
    Response,
    Request,
    NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";
import { ValidateError } from "tsoa";
import { AhError } from "../errors/AhError";

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
    if (err instanceof AhError) {
        return res.status(StatusCodes.EXPECTATION_FAILED).json({
            message: "External API returned an error",
            details: err.message,
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