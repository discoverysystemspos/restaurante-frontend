import { Entradas } from '../models/entradas.model';

export interface LoadEntradas{
    movimientos: Entradas[],
    ok: boolean,
    total: number
}