import { env } from '@/env';
import { db } from '@src/database/db';
import { user } from '@src/database/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { z } from 'zod';

const { sign } = jsonwebtoken;

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
    const { email, password } = req.body;

    const emailSchema = z.string().email().safeParse(email);
    const passwordSchema = z.string().min(4).safeParse(password);

    if (!emailSchema.success || !passwordSchema.success)
        return res.status(200).send('Invalid credentials');

    const foundUser = await db.select().from(user).where(eq(user.email, email));

    const validPassword = await bcrypt.compare(password, foundUser[0].password);

    if (foundUser.length === 0 || !validPassword)
        return res.status(200).send('Invalid credentials');

    const token = sign({ userId: foundUser[0].id }, env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('session', token, { maxAge: 60 * 60 * 24 * 30, httpOnly: true });

    if (req.headers['hx-boosted']) {
        res.header('hx-redirect', '/todos/app');
        return res.sendStatus(201);
    }

    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/signin');

    return res.status(200).render('todos/signin');
});

authController.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    const emailSchema = z.string().email().safeParse(email);
    const passwordSchema = z.string().min(4).safeParse(password);

    if (!emailSchema.success) {
        return res.status(200).send('Invalid email');
    }

    if (!passwordSchema.success) {
        return res.status(200).send('Invalid password');
    }

    const foundUser = await db.select().from(user).where(eq(user.email, email));

    if (foundUser.length > 0) {
        return res.status(200).send('This email is already in use.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
        .insert(user)
        .values({
            email: emailSchema.data,
            password: hashedPassword,
        })
        .returning({ id: user.id });

    const token = sign({ userId: newUser[0].id }, env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('session', token, { maxAge: 60 * 60 * 24 * 30, httpOnly: true });

    if (req.headers['hx-boosted']) {
        res.header('hx-redirect', '/todos/app');
        return res.sendStatus(201);
    }

    return res.redirect(301, '/todos/app');
});
