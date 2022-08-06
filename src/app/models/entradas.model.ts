export class Entradas {

    constructor(
        public user: string,
        public monto: number,
        public descripcion: string,
        public type: string,
        public turno: string,
        public status: boolean,
        public fecha: Date,
    ){}

}