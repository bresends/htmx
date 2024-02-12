import { relations } from 'drizzle-orm';

import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    timestamp,
    boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    password: varchar('password', { length: 256 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    todos: many(todos),
}));

export const todos = pgTable('todos', {
    id: serial('id').primaryKey(),
    todo: varchar('todo').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    done: boolean('done').default(false),
    userId: integer('user_id')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
});

export const todosRelations = relations(todos, ({ one }) => ({
    user: one(users, {
        fields: [todos.userId],
        references: [users.id],
    }),
}));
