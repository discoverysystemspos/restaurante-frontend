export class Entradas {

    constructor(
        public user: any,
        public monto: number,
        public descripcion: string,
        public type: string,
        public turno: string,
        public status: boolean,
        public fecha: Date,
    ){}

}