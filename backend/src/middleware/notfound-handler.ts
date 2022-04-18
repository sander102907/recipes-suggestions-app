import { StatusCodes } from "http-status-codes";
import {
    Response,
    Request
} from "express";

export default function notFoundHandler(_req: Request, res: Response) {
    res.status(StatusCodes.NOT_FOUND).send({
        message: "Not Found",
    });
}