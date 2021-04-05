//  Model Caja
export class Caja{

    constructor(
        public name:string,
        public description?: string,
        public cajero?: string,
        public turno?: string,
        public cerrada?: boolean,
        public status?: boolean,
        public caid?:string,
        public _id?:string
    ){}

}