import { environment } from "../../environments/environment"

const base_url = environment.base_url;

export class Client {    

    constructor(
        public name: string,
        public cedula: string,
        public phone?: string,
        public email?: string,
        public address?: string,
        public city?: string,
        public department?: string,
        public zip?: string,
        public status?: string,
        public fecha?: string,
        public cid?: string,
    ){}
    

};