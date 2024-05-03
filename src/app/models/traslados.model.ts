import { Bodega } from "./bodegas.model";

interface _product{
    code: string,
    name: string,
    qty: number,
    cost: number,
    price: number,
    wholesale: number,
}

export class Traslado{

    constructor(
        public referencia: string,
        public user: string,
        public recibe: string,
        public bodega: Bodega,
        public products: _product[],
        public estado: string,
        public type: string,
        public status: boolean,
        public trasid: string,
        public fechaIn: Date,
        public fecha: Date,
        public _id?: string,
        public traid?: string
    ){}

}