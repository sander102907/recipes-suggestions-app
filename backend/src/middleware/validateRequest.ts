import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

const validate = (checks: any) => [
    ...checks,
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }

        next();
    },
];

export default validate;