import { db } from '@src/database/db';
import { contact } from '@src/database/schema';
import { asc, ilike } from 'drizzle-orm';
import { Router } from 'express';
import { PostgresError } from 'postgres';
import { z } from 'zod';

export const contactsRouter = Router();

contactsRouter.get('/', async (req, res) => {
    const query = req.query.q;
    const searchValue = query || '';
    const page = req.query.page || 1;

    const filteredUsers = await db
        .select()
        .from(contact)
        .orderBy(asc(contact.name), asc(contact.rg))
        .where(ilike(contact.name, `%${searchValue}%`))
        .limit(10)
        .offset((Number(page) - 1) * 10);

    if (req.headers['hx-trigger'] == 'search')
        return res.status(200).render('contacts/partials/contacts_table', {
            contacts: filteredUsers,
        });

    return res.status(200).render('contacts/pages/index', {
        contacts: filteredUsers,
        searchValue,
        page,
    });
});

// contactsRouter.delete('/', async (req, res) => {
//     const query = req.query.q;
//     const searchValue = query || '';
//     const page = req.query.page || 1;

//     const contactIdsSchema = z
//         .array(z.string())
//         .safeParse(req.body.selected_contact_ids);

//     if (!contactIdsSchema.success) {
//         return res.status(200).send('Invalid contact ids');
//     }

//     const ids = contactIdsSchema.data.map((id) => Number(id));

//     await db.delete(contact).where(inArray(contact.rg, ids));

//     const filteredUsers = await db
//         .select()
//         .from(contact)
//         .orderBy(asc(contact.name), asc(contact.rg))
//         .where(ilike(contact.name, `%${searchValue}%`))
//         .limit(10)
//         .offset((Number(page) - 1) * 10);

//     return res.status(200).render('contacts/pages/index', {
//         contacts: filteredUsers,
//         searchValue,
//         page,
//     });
// });

// contactsRouter.get('/count', async (req, res) => {
//     const totalContacts = await db.select({ value: count() }).from(contact);
//     return res.status(200).send(`(${totalContacts[0].value} total contacts)`);
// });

contactsRouter.get('/new', async (req, res) => {
    return res.status(200).render('contacts/pages/new');
});

contactsRouter.post('/new', async (req, res) => {
    const contactSchema = z.object({
        email: z.string().email(),
        name: z
            .string()
            .min(3, { message: 'Name must be at least 3 characters long' }),
        blood_type: z.string(),
        phone_number: z.string(),
        rg: z.number(),
        unit: z.string().min(1),
        rank: z.string().min(1),
        division: z.string().min(1),
    });
    try {
        const {
            blood_type,
            email,
            name,
            phone_number,
            rg,
            division,
            unit,
            rank,
        } = contactSchema.parse(req.body);

        await db.insert(contact).values({
            blood_type,
            name,
            email,
            phone_number,
            rg,
            unit,
            division,
            rank,
        });
        return res.redirect(301, '/contacts');
    } catch (error) {
        if (error instanceof z.ZodError) {
            if (error instanceof z.ZodError) {
                res.status(200).render('contacts/pages/new', {
                    errors: error.errors,
                    formData: req.body,
                });
            }
        } else if ((error as PostgresError).code === '23505') {
            res.status(200).render('contacts/pages/new', {
                errors: [{ message: 'Email already exists' }],
                formData: req.body,
            });
        } else {
            console.error('Error creating contact:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

// contactsRouter.get('/:contact_id/edit', async (req, res) => {
//     const contactId = req.params.contact_id;

//     const user = await db
//         .select()
//         .from(contact)
//         .where(eq(contact.rg, Number(contactId)));

//     return res.status(200).render('contacts/pages/edit', { contact: user[0] });
// });

// contactsRouter.post('/:contact_id/edit', async (req, res) => {
//     const contactId = req.params.contact_id;

//     const contactSchema = z.object({
//         email: z.string().email(),
//         name: z
//             .string()
//             .min(3, { message: 'Name must be at least 3 characters long' }),
//         password: z
//             .string()
//             .min(3, { message: 'Password must be at least 8 characters long' }),
//     });

//     try {
//         const { email, name, password } = contactSchema.parse(req.body);
//         await db
//             .update(contact)
//             .set({
//                 name,
//                 email,
//             })
//             .where(eq(contact.rg, Number(contactId)));
//         return res.redirect(301, `/contacts/${contactId}`);
//     } catch (error) {
//         if (error instanceof z.ZodError) {
//             if (error instanceof z.ZodError) {
//                 res.status(400).render(`/contacts/${contactId}/edit`, {
//                     errors: error.errors,
//                     formData: req.body,
//                 });
//             }
//         } else {
//             console.error('Error creating contact:', error);
//             res.status(500).send('Internal Server Error');
//         }
//     }
// });

// contactsRouter.get('/:contact_id/verify_email', async (req, res) => {
//     const contactId = req.params.contact_id;
//     const email = req.query.email;

//     const validEmail = z.string().email().safeParse(email);

//     if (!validEmail.success) {
//         return res.status(200).send('Invalid email');
//     }

//     const emailExists = await db
//         .select()
//         .from(contact)
//         .where(eq(contact.email, validEmail.data));

//     if (!emailExists.length) {
//         return res.status(200).send('');
//     }

//     if (emailExists[0].rg === Number(contactId)) {
//         return res.status(200).send('This is your current registered email');
//     }

//     return res.status(200).send('Email already in use');
// });

// contactsRouter.delete('/:contact_id', async (req, res) => {
//     const contactId = req.params.contact_id;
//     await db.delete(contact).where(eq(contact.rg, Number(contactId)));
//     return res.redirect(303, '/contacts');
// });

// contactsRouter.get('/:contact_id', async (req, res) => {
//     const contactId = req.params.contact_id;

//     const user = await db
//         .select()
//         .from(contact)
//         .where(eq(contact.rg, Number(contactId)));

//     return res
//         .status(200)
//         .render('contacts/pages/contact_details', { contact: user[0] });
// });
