import { Router } from 'express';
import { db } from '@src/database/db';
import { users } from '@src/database/schema';
import { like } from 'drizzle-orm';

export const contacts = Router();

contacts.get('/', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        const allUsers = await db.select().from(users);
        return res
            .status(200)
            .render('contacts/app/index', { contacts: allUsers });
    }
    const filteredUsers = await db
        .select()
        .from(users)
        .where(like(users.name, `%${query}%`));

    return res
        .status(200)
        .render('contacts/app/index', { contacts: filteredUsers });
});

contacts.get('/new', (req, res) => {
    return res.status(200).render('contacts/new');
});

contacts.post('/new', async (req, res) => {
    const { name, email, password } = req.body;

    if (name.length < 5)
        return res.render('/contacts/app/new', { contacts: name });

    // await db.insert(users).values({
    //     name,
    //     password,
    //     email,
    // });
    return res.redirect(301, '/contacts');
});
