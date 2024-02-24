import { Router } from 'express';
import { db } from '@src/database/db';
import { user } from '@src/database/schema';
import { authController } from '@src/controllers/todos/authController';

export const todos = Router();

todos.get('/', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/hero');

    return res.status(200).render('todos/index', { value: 'Hi you. Hello' });
});

todos.get('/about', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/about');

    return res.status(200).render('todos/about');
});

todos.get('/app', async (req, res) => {
    const allUsers = await db.select().from(user);

    return res.status(200).render('todos/app/index', {
        allUsers,
        email: req.cookies.session,
    });
});

todos.use(authController);
