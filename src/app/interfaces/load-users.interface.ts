import { User } from '../models/user.model';

export interface _privilegios{
    cierre: boolean;
    comandas: boolean;
    mpv: boolean;
    parqueaderop?: boolean;
    delpv?: boolean;
}


export interface LoadUsers{
    total: number;
    users: User[];
}