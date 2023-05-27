export class Impuestos{

    constructor(
        public name: string,
        public valor: number,
        public status: boolean,
        public _id: string,
        public taxid: string,
        public total: number,
        public taxcategory: string,
    ){}

}