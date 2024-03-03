import { authController } from '@src/controllers/todos/authController';
import { db } from '@src/database/db';
import { todo } from '@src/database/schema';
import { verifyJWT } from '@src/middleware/verifySession';
import { and, desc, eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { Router } from 'express';
import { ZodError } from 'zod';

export const todos = Router();

todos.get('/about', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/about');

    return res.status(200).render('todos/about');
});

todos.get('/app', verifyJWT, async (req, res) => {
    const todos = await db
        .select()
        .from(todo)
        .where(eq(todo.userId, res.locals.userId))
        .orderBy(desc(todo.createdAt));

    return res.status(200).render('todos/app/index', {
        id: res.locals.userId,
        todos,
    });
});

todos.post('/app', verifyJWT, async (req, res) => {
    const insertTodoSchema = createInsertSchema(todo, {
        title: (schema) =>
            schema.title.min(
                3,
                'Please provide a title with more than 2 characters',
            ),
    });

    try {
        const parsedTodo = insertTodoSchema.parse({
            ...req.body,
            userId: res.locals.userId,
        });

        const newTodo = await db
            .insert(todo)
            .values({
                title: parsedTodo.title,
                content: parsedTodo.content,
                userId: parsedTodo.userId,
            })
            .returning();

        return res
            .status(201)
            .render('todos/partials/todos/todo-item', { todos: [newTodo] });
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(200)
                .render('todos/partials/todos/new-todo-form', {
                    errors: error.errors,
                    formData: req.body,
                });
        }
        return res.status(200).render('todos/partials/todos/new-todo-form', {
            errors: ['Something went wrong, please try again later.'],
            formData: req.body,
        });
    }
});

todos.patch('/app/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;

    try {
        const updatedTodo = await db
            .update(todo)
            .set({
                done: !!req.body.done,
            })
            .where(
                and(
                    eq(todo.id, Number(id)),
                    eq(todo.userId, res.locals.userId),
                ),
            );
        return res
            .status(201)
            .render('todos/partials/todos/todo-item', { todo: updatedTodo });
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(200)
                .render('todos/partials/todos/new-todo-form', {
                    errors: error.errors,
                    formData: req.body,
                });
        }
        return res.status(200).render('todos/partials/todos/new-todo-form', {
            errors: ['Something went wrong, please try again later.'],
            formData: req.body,
        });
    }
});

todos.get('/', (req, res) => {
    if (req.headers['hx-boosted'])
        return res.status(200).render('todos/partials/hero');
    return res.status(200).render('todos/index', { value: 'Hi you. Hello' });
});

todos.use(authController);
