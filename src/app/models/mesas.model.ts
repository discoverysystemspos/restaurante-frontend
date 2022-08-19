import { Carrito, _notas } from '../interfaces/carrito.interface';

interface _mesero{
    name: string;
    _id: string;
}

export interface _ingredientes {
    status: boolean;
    name: string;
    qty: number;
    _id?: string;
}

export interface _comanda {
    product: string;
    ingredientes: _ingredientes[];
    qty: number;
    nota: string;
    estado: string;
    _id?: string;
}

export class Mesa {    

    constructor(
        public name: string,
        public disponible: boolean,
        public status: boolean,
        public carrito?: Carrito[],
        public mesero?: _mesero,
        public fecha?: Date,
        public mid?: string,
        public img?: string,
        public cliente?: string,
        public nota?: _notas[],
        public comanda?: _comanda[],
        public menu?: boolean,
        public ingredientes?: _ingredientes[],
        public descuento?: boolean,
        public porcentaje?: number
    ){}

};