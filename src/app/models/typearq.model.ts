export class Typeparq{
    constructor(
        public name: string,
        public price: number,
        public status: boolean,
        public fecha: Date,
        public tpid?: string,
        public _id?: string,
    ){}
}