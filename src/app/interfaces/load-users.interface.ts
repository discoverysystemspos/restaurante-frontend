import { User } from '../models/user.model';

export interface _privilegios{
    cierre: boolean;
}


export interface LoadUsers{
    total: number;
    users: User[];
}