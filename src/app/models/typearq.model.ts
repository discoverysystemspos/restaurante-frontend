import { Impuesto } from "./impuesto.model";

export class Typeparq{
    constructor(
        public name: string,
        public price: number,
        public status: boolean,
        public fecha: Date,
        public plena: number,
        public tplena: number,
        public type: 'Minutos' | 'Horas',
        public tax: Impuesto,
        public tpid?: string,
        public _id?: string,
    ){}
}