import type {
    Request, Response, NextFunction,
    RequestHandler
} from "express";

export const asyncHandler = (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
):RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    }
}