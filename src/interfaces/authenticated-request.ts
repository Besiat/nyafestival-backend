import { Request } from 'express';
import { User } from '../entity/website/user';

export type AuthenticatedRequest = Request & {
    user: User;
};
