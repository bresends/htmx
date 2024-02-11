import { Router } from 'express';
import { todos } from './todos';

export const root = Router();

root.use('/todos', todos);
