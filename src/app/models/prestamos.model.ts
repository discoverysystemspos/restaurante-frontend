import { Client } from "./client.model";

interface _payments{
    type: string,
    amount: number,
    description: string,
    fecha: Date,
}

export class Prestamo{

    constructor(
        public client: Client,
        public diario: boolean,
        public frecuencia: number,
        public payments: _payments[],
        public vence: number,
        public monto: number,
        public porcentaje: number,
        public completo: boolean,
        public status: boolean,
        public fecha: Date,
        public presid: string,
        public _id: string,
    ){}

}