import { Typeparq } from "./typearq.model";

export class Car{
    constructor(
        public placa: string,
        public cliente: string,
        public typeparq: Typeparq,
        public status: boolean,
        public fecha: Date,
    ){}
}