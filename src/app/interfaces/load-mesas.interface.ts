// MESAS
import { Mesa } from '../models/mesas.model';
import { LoadCarrito, Carrito } from './carrito.interface';


export interface LoadMesas{
    ok: boolean;
    mesas: Mesa[];
    total: number;
}

export interface LoadMesaId{
    name: string;
    disponible: boolean;
    status: boolean;
    carrito?: LoadCarrito[];
    fecha?: Date;
    mid?: string;
    img?: string;
    nota?: string;
}