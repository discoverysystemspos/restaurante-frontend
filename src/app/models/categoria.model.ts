import { environment } from "../../environments/environment"
import { Department } from './department.model';

const base_url = environment.base_url;

export class Categoria{

    constructor(
        public name:string,
        public status?: boolean,
        public visibility?: boolean,
        public department?: any[],
        public img?: string,
        public catid?:string,
        public _id?:string
    ){}

    /** ================================================================
    *   GET IMAGE
    ==================================================================== */    
    get getImage(){        
        
        if (this.img) {            
            return `${base_url}/uploads/categoria/${this.img}`;
        }else{
            return `${base_url}/uploads/categoria/no-image`;
        }
    }

}