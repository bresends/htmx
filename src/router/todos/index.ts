import { Router } from 'express';
import { db } from '@src/database/db';
import { users } from '@src/database/schema';

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

todos.get('/signin', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/signin');

    return res.status(200).render('todos/signin');
});

todos.post('/signin', async (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/signin');

    return res.status(200).render('todos/signin');
});

todos.get('/signup', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/signup');

    return res.status(200).render('todos/signup');
});

todos.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    res.cookie('session', email, { maxAge: 60 * 60 * 24 * 30, httpOnly: true });
    await db.insert(users).values({
        email,
        password,
    });

    if (req.headers['hx-boosted']) {
        res.header('hx-redirect', '/todos/app');
        return res.sendStatus(201);
    }

    return res.redirect(301, '/todos/app');
});

todos.get('/logout', (req, res) => {
    res.cookie('session', '', { maxAge: 0, httpOnly: true });

    if (req.headers['hx-boosted']) {
        res.header('hx-redirect', '/todos/signin');
        return res.sendStatus(200);
    }

    return res.redirect(301, '/todos/signin');
});

todos.get('/app', async (req, res) => {
    const allUsers = await db.select().from(users);

    return res.status(200).render('todos/app/index', {
        allUsers,
        email: req.cookies.session,
    });
});
