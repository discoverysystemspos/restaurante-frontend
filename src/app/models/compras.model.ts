import { _payments } from "../interfaces/carrito.interface";
import { Product } from "./product.model";
import { Proveedor } from "./proveedor.model";
import { User } from "./user.model";

export interface itemCompra{
    product: Product,
    qty: number,
    cost: number,
    price: number,
    wholesale?: number;
}

export class Compra{
    constructor(
        public invoice: number,
        public proveedor: Proveedor,
        public user: User,
        public products: itemCompra[],
        public amount: number,
        public base: number,
        public credito: boolean,
        public status: boolean,
        public payments: _payments[],
        public fecha: Date,
        public _id?: string,
        public comid?: string
    ){}
}