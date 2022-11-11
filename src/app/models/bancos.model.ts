export class Banco{

    constructor(
        public name: string,
        public status: boolean,
        public baid: string,
        public _id: string,
        public monto?: number
    ){}

}