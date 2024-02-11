import express from 'express';
import { env } from '../env';
import { db } from './database/db';
import { count } from 'drizzle-orm';
import { todos } from './database/schema';
import { Liquid } from 'liquidjs';

const app = express();

app.engine('liquid', new Liquid().express());
app.set('views', './src/views');
app.set('view engine', 'liquid');

app.use(express.static('public'));

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

app.get('/db', async (req, res) => {
    const totalTodos = await db.select({ value: count(todos.id) }).from(todos);
    res.status(200).send({ totalTodos });
});

app.listen(env.PORT, () => {
    console.log(`Listening on port ${env.PORT}...`);
});
