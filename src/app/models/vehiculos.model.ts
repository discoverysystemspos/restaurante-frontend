import { Client } from "./client.model";

interface _tech{
    title: string,
    description: string
}

export class Vehiculo{

    constructor(
        public client: Client,
        public brand: string,
        public model: string,
        public year: string,
        public description: string,
        public placa: string,
        public tech: _tech[],
        public status: boolean,
        public fecha: Date,
        public vid: string,
        public _id: string
    ){}

}