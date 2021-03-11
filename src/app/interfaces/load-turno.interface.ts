import { _caja, _cajero } from './load-caja.interface';

export interface _movements {
    descripcion: string;
    monto: number;
    type: string;
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
    sales?: any[];
    tid?: string;
    montoD?: number;
    cierre?: Date;

}

export interface LoadsTurnos{
    ok: boolean;
    turnos: LoadTurno[];
    total: number;
}