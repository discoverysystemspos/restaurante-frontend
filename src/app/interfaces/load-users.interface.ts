import { User } from '../models/user.model';

export interface _privilegios{
    cierre: boolean;
    comandas: boolean;
}


export interface LoadUsers{
    total: number;
    users: User[];
}