export class Impuesto{

    constructor(
        public name: string,
        public valor: number,        
        public taxcategory?: string,
        public _id?: string,
        public taxid?: string,
    ){}


}