import { environment } from "../../environments/environment"

const base_url = environment.base_url;

export class Proveedor {    

    constructor(
        public name: string,
        public cedula: string,
        public _id?: string,
        public provid?: string,
        public phone?: string,
        public email?: string,
        public address?: string,
        public city?: string,
        public department?: string,
        public zip?: string,
        public status?: boolean,
        public fecha?: Date
    ){}
    

};