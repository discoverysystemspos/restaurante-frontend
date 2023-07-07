import { Invoice } from '../models/invoice.model';
import { Product } from '../models/product.model';
import { _caja, _cajero } from './load-caja.interface';

export interface _movements {
    descripcion: string;
    monto: number;
    type: string;
}

export interface _devolucion{
    factura: any;
    product: any;
    qty: number;
    price: number;
    monto: number;
}

export interface LoadTurno {

    caja: _caja;
    cajero: _cajero;
    cerrado: boolean;
    diferencia: boolean;
    fecha: Date;
    initial: number;
    status: boolean;
    movements?: _movements[];
    abonos?: any[];
    alquileres?: any[];
    sales?: any[];
    tid?: string;
    montoD?: number;
    cierre?: Date;
    devolucion?: _devolucion[];

}

export interface LoadsTurnos{
    ok: boolean;
    turnos: LoadTurno[];
    total: number;
}