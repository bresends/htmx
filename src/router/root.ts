import { Router } from 'express';
import { todos } from './todos';
import { contactsRouter } from './contacts';

export const root = Router();

root.use('/todos', todos);
root.use('/contacts', contactsRouter);
