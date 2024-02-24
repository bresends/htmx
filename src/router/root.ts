import { Router } from 'express';
import { todos } from './todos';
import { contactsRouter } from './contacts';

export const rootRouter = Router();

rootRouter.use('/todos', todos);
rootRouter.use('/contacts', contactsRouter);
