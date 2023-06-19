import { Client } from "./client.model";
import { Product } from "./product.model";
import { User } from "./user.model";

interface _Items {
    product: Product;
    qty: number;
    price: number;
    desde: number;
    hasta: number;
    entregado: boolean;
}

interface _Payments {
    type: string;
    amount: number;
    description: string;
    fecha: Date;
}

export class Alquiler{
    constructor(
        public client: Client,
        public address: string,
        public amount: string,
        public fecha: string,
        public user: User,
        public status: string,
        public items: _Items[],
        public payments: _Payments[],
        public number?: string,

    ){}
}