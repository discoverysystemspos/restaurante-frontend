export class Bodega{
    constructor(
        public name: string,
        public endpoint: string,
        public status: boolean,
        public fecha: Date,
        public bid?: string,
        public _id?: string,
    ){}
}