import { Client } from 'src/app/models/client.model';
import { User } from 'src/app/models/user.model';
import { LoadCarrito } from '../interfaces/carrito.interface';

export class Pedido{

    constructor(
        public pedido:number,
        public client?: Client,
        public cliente?: any,
        public user?: User,
        public products?: LoadCarrito[],
        public amount?: number,
        public payments?:string,
        public ciudad?:string,
        public departamento?:string,
        public direccion?:string,
        public telefono?:string,
        public comentario?:string,
        public estado?:string,
        public paystatus?:string,
        public referencia?:string,
        public transaccion?:string,
        public status?:string,
        public fecha?:string,
        public peid?:string,
    ){}

}