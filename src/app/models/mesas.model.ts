import { Carrito, _notas } from '../interfaces/carrito.interface';
import { Piso } from './pisos.model';

interface _images{
    img: string;
    date: Date;
    _id: string;
}

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
    product: any;
    ingredientes: _ingredientes[];
    qty: number;
    nota: string;
    estado: string;
    _id?: string;
    fecha?: Date;
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
        public images?: _images[],
        public descuento?: boolean,
        public porcentaje?: number,
        public notaf?: string,
        public placa?: string,
        public piso?: Piso,
        public deleteClient?: boolean
    ){}

};