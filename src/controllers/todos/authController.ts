import { Router } from 'express';
import { db } from '@src/database/db';
import { user } from '@src/database/schema';

export const authController = Router();

authController.get('/signin', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/signin');

    return res.status(200).render('todos/signin');
});

authController.get('/signup', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/signup');

    return res.status(200).render('todos/signup');
});

authController.get('/logout', (req, res) => {
    res.cookie('session', '', { maxAge: 0, httpOnly: true });

    if (req.headers['hx-boosted']) {
        res.header('hx-redirect', '/todos/signin');
        return res.sendStatus(200);
    }

    return res.redirect(301, '/todos/signin');
});

authController.post('/signin', async (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/signin');

    return res.status(200).render('todos/signin');
});

authController.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    res.cookie('session', email, { maxAge: 60 * 60 * 24 * 30, httpOnly: true });

    await db.insert(user).values({
        email,
        password,
    });

    if (req.headers['hx-boosted']) {
        res.header('hx-redirect', '/todos/app');
        return res.sendStatus(201);
    }

    return res.redirect(301, '/todos/app');
});
