import express from 'express';
import { env } from '../env';
import { db } from './database/db';
import { users } from './database/schema';
import { Liquid } from 'liquidjs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const app = express();

app.engine('liquid', new Liquid().express());
app.set('views', './src/views');
app.set('view engine', 'liquid');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('partials/hero');

    res.status(200).render('index', { value: 'Hi you. Hello' });
});

app.get('/about', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('partials/about');

    res.status(200).render('about');
});

app.get('/signin', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('partials/signin');

    res.status(200).render('signin');
});

app.post('/signin', async (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('partials/signin');

    res.status(200).render('signin');
});

app.get('/signup', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('partials/signup');

    res.status(200).render('signup');
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    res.cookie('session', email, { maxAge: 60 * 60 * 24 * 30, httpOnly: true });
    await db.insert(users).values({
        email,
        password,
    });

    if (req.headers['hx-boosted']) {
        res.header('hx-redirect', '/app');
        return res.sendStatus(201);
    }

    return res.redirect(301, '/app');
});

app.get('/logout', (req, res) => {
    res.cookie('session', '', { maxAge: 0, httpOnly: true });

    if (req.headers['hx-boosted']) {
        res.header('hx-redirect', '/signin');
        return res.sendStatus(200);
    }

    return res.redirect(301, '/signin');
});

app.get('/app', async (req, res) => {
    const allUsers = await db.select().from(users);

    res.status(200).render('app/index', {
        allUsers,
        email: req.cookies.session,
    });
});

app.listen(env.PORT, () => {
    console.log(`Listening on port ${env.PORT}...`);
});
