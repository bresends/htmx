import { Router } from 'express';
import { db } from '@src/database/db';
import { users } from '@src/database/schema';
import { eq, ilike } from 'drizzle-orm';
import { z } from 'zod';

export const contacts = Router();

contacts.get('/', async (req, res) => {
    const query = req.query.q;
    const searchValue = query || '';

    const filteredUsers = await db
        .select()
        .from(users)
        .where(ilike(users.name, `%${searchValue}%`));

    return res
        .status(200)
        .render('contacts/app/index', { contacts: filteredUsers, searchValue });
});

contacts.get('/new', (req, res) => {
    return res.status(200).render('contacts/new');
});

contacts.post('/new', async (req, res) => {
    const contactSchema = z.object({
        email: z.string().email(),
        name: z
            .string()
            .min(5, { message: 'Name must be at least 5 characters long' }),
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long' }),
    });
    try {
        // Validate request body against the schema
        const { email, name, password } = contactSchema.parse(req.body);
        await db.insert(users).values({
            name,
            password,
            email,
        });
        return res.redirect(301, '/contacts');
    } catch (error) {
        if (error instanceof z.ZodError) {
            if (error instanceof z.ZodError) {
                res.status(400).render('contacts/new', {
                    errors: error.errors,
                    formData: req.body,
                });
            }
        } else {
            console.error('Error creating contact:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

contacts.get('/:contact_id/edit', async (req, res) => {
    const contactId = req.params.contact_id;

    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(contactId)));

    return res.status(200).render('contacts/edit', { contact: user[0] });
});

contacts.post('/:contact_id/edit', async (req, res) => {
    const contactId = req.params.contact_id;

    const contactSchema = z.object({
        email: z.string().email(),
        name: z
            .string()
            .min(5, { message: 'Name must be at least 5 characters long' }),
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long' }),
    });

    try {
        const { email, name, password } = contactSchema.parse(req.body);
        await db.update(users).set({
            name,
            password,
            email,
        });
        return res.redirect(301, `/contacts/${contactId}`);
    } catch (error) {
        if (error instanceof z.ZodError) {
            if (error instanceof z.ZodError) {
                res.status(400).render(`/contacts/${contactId}/edit`, {
                    errors: error.errors,
                    formData: req.body,
                });
            }
        } else {
            console.error('Error creating contact:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

contacts.get('/:contact_id/delete', async (req, res) => {
    const contactId = req.params.contact_id;
    await db.delete(users).where(eq(users.id, Number(contactId)));
    return res.redirect(301, '/contacts');
});

contacts.get('/:contact_id', async (req, res) => {
    const contactId = req.params.contact_id;

    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(contactId)));

    return res
        .status(200)
        .render('contacts/contact_details', { contact: user[0] });
});
