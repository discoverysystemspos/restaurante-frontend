// INTERFACES
import { Carrito, _payments, _paymentsCredito } from '../interfaces/carrito.interface';
import { _devolucion } from '../interfaces/load-turno.interface';

export interface _images{
    img: string;
    date: Date;
    _id: string;
}

export class Invoice {
    
    constructor(
        public client: string,
        public type: string,
        public amount: number,
        public products: Carrito[],
        public payments?: _payments[],
        public credito?: boolean,
        public status?: boolean,
        public fecha?: Date,
        public invoice?: number,
        public control?: number,
        public iid?: string,
        public placa?: string,
        public pago?: number,
        public images?: _images[],
        public vueltos?: number,
        public nota?: string,
        public cufe?: string,
        public apartado?: boolean,
        public marca?: boolean,
        public descuento?: boolean,
        public porcentaje?: number,
        public paymentsCredit?: _paymentsCredito[],
        public devolucion?: _devolucion[],
        public electronica?: boolean,
        public send?: boolean,
        public number?: string,
        public paymentsAlquiler?: _paymentsCredito[]
    ){}

}