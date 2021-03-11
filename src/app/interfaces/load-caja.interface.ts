import { Caja } from '../models/caja.model';

export interface _cajero{
    _id?: string;
    name?: string;
}

export interface _caja{
    name: string;
    cerrada: boolean;
    status: boolean;
    caid: string;
    _id: string;
    cajero?: _cajero;
    fecha?: Date;
    description?: string;
}

export interface LoadCaja{
    cajas: _caja[];
    total: number;
}