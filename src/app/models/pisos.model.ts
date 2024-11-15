import { Mesa } from "./mesas.model";

export class Piso{
    constructor(
        public name: string,
        public mesas: Mesa[],
        public status: boolean,
        public fecha: Date,
        public _id?: string,
        public piid?: string,
    ){}
}