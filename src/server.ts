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

app.get('/', (req, res) => {
    res.status(200).render('index', { value: 'Hi. Hello' });
});

app.get('/db', async (req, res) => {
    const totalTodos = await db.select({ value: count(todos.id) }).from(todos);
    res.status(200).send({ totalTodos });
});

app.listen(env.PORT, () => {
    console.log(`Listening on port ${env.PORT}...`);
});
