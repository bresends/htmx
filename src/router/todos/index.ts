import { authController } from '@src/controllers/todos/authController';
import { db } from '@src/database/db';
import { user } from '@src/database/schema';
import { verifyJWT } from '@src/middleware/verifySession';
import { Router } from 'express';
import jsonwebtoken from 'jsonwebtoken';

const { verify } = jsonwebtoken;

export const todos = Router();

todos.get('/about', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/about');

    return res.status(200).render('todos/about');
});

todos.get('/app', verifyJWT, async (req, res) => {
    const allUsers = await db.select().from(user);

    return res.status(200).render('todos/app/index', {
        allUsers,
        id: res.locals.userId,
    });
});

todos.get('/', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/hero');

    return res.status(200).render('todos/index', { value: 'Hi you. Hello' });
});

todos.use(authController);
