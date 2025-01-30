import { Bodega } from "./bodegas.model";

export interface _productTraslados{
    code: string,
    name: string,
    qty: number,
    cost: number,
    gain: number,
    price: number,
    wholesale: number,
    distribuidor: number,
    confirmado: boolean
}

export class Traslado{

    constructor(
        public referencia: string,
        public user: string,
        public recibe: string,
        public desde: string,
        public bodega: Bodega,
        public products: _productTraslados[],
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