import { Router } from 'express';
import { todos } from './todos';
import { contacts } from './contacts';

export const root = Router();

root.use('/todos', todos);
root.use('/contacts', contacts);
