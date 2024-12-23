import { environment } from "../../environments/environment"
import { _privilegios } from '../interfaces/load-users.interface';

const base_url = environment.base_url;



export class User {    

    constructor(
        public usuario: string,
        public name: string,
        public password?: string,
        public role?: 'ADMIN' | 'STAFF' | 'CASHIER' | 'WAITER' | 'WAITERALL',
        public img?: string,
        public uid?: string,
        public status?: boolean,
        public cerrada?: boolean,
        public turno?: string,
        public privilegios?: _privilegios,
    ){}

    /** ================================================================
    *   GET IMAGE
    ==================================================================== */    
    get getImage(){        
        
        if (this.img) {            
            return `${base_url}/uploads/user/${this.img}`;
        }else{
            return `${base_url}/uploads/user/no-image`;
        }
    }

};