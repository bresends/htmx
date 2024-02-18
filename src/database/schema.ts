import { relations } from 'drizzle-orm';

import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    timestamp,
    boolean,
    smallint,
    char,
} from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
    id: serial('id').primaryKey(),
    password: varchar('password', { length: 256 }).notNull(),
});

export const usersRelations = relations(user, ({ many }) => ({
    todos: many(todo),
}));

export const contact = pgTable('contacts', {
    rg: smallint('rg').primaryKey(),
    blood_type: char('blood_type', { length: 2 }).notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    phone_number: varchar('phone', { length: 20 }).notNull(),
    rank: varchar('rank', { length: 50 }).notNull(),
    unit: varchar('unit', { length: 100 }).notNull(),
    division: varchar('division', { length: 100 }).notNull(),

    userId: integer('user_id').references(() => user.id, {
        onDelete: 'no action',
    }),
});

export const contactsRelations = relations(contact, ({ one }) => ({
    user: one(user, {
        fields: [contact.userId],
        references: [user.id],
    }),
}));

export const todo = pgTable('todos', {
    id: serial('id').primaryKey(),
    todo: varchar('todo').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    done: boolean('done').default(false),
    userId: integer('user_id')
        .references(() => user.id, {
            onDelete: 'cascade',
        })
        .notNull(),
});

export const todosRelations = relations(todo, ({ one }) => ({
    user: one(user, {
        fields: [todo.userId],
        references: [user.id],
    }),
}));
