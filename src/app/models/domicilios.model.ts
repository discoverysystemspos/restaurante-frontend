import { Product } from "./product.model"

interface _carrito{
    product: Product,
    qty: number,
    monto: number,
    _id?: string
}

interface _ubicacion{
    lat: number,
    lng: number,
    _id?: string
}

export class Domicilio{

    constructor(
        public ubicacion: _ubicacion,
        public name: string,
        public nombres: string,
        public referencia: string,
        public telefono: string,
        public nota: string,
        public wid: string,
        public estado: string,
        public carrito: _carrito[],
        public pago: boolean,
        public status: boolean,
        public fecha: Date,
        public doid?: string,
        public _id?: string,
    ){}

}