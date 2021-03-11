// INTERFACES
import { Carrito, _payments } from '../interfaces/carrito.interface';

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
        public iid?: string,
    ){}

}