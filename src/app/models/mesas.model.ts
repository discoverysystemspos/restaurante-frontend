import { Carrito } from '../interfaces/carrito.interface';

interface _mesero{
    name: string;
    _id: string;
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
        public img?: string
    ){}

    

};