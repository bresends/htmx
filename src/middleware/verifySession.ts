import { env } from '@/env';
import { type NextFunction, type Request, type Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

const { verify } = jsonwebtoken;

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const sessionJWT = req.cookies.session;

    if (!sessionJWT) return res.redirect(301, '/todos/signin');

    const payload = verify(sessionJWT, env.JWT_SECRET) as {
        userId: number;
    };

    if (!payload) return res.redirect(301, '/todos/signin');

    res.locals.userId = payload.userId;

    next();
};
