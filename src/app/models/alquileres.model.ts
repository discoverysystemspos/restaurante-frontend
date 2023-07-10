import { Client } from "./client.model";
import { Product } from "./product.model";
import { User } from "./user.model";

export interface _Items {
    product: Product;
    qty: number;
    price: number;
    desde: Date;
    entregado: boolean;
    dias?: number;
    hasta?: Date;
    _id?: string;
}

export interface _Payments {
    type: string;
    amount: number;
    description: string;
    fecha: Date;
    turno?: any;
}

export class Alquiler{
    constructor(
        public client: Client,
        public address: string,
        public amount: number,
        public fecha: string,
        public user: User,
        public status: boolean,
        public items: _Items[],
        public payments: _Payments[],
        public number?: string,
        public fechaIni?: Date,
        public cotizacion?: boolean,
        public alid?: string,
        public finalizada?: boolean,
        public _id?: string,
    ){}
}