import { environment } from "../../environments/environment"

const base_url = environment.base_url;

export class Department{

    constructor(
        public name?:string,
        public status?: boolean,
        public visibility?: boolean,
        public img?: string,
        public did?:string,
        public _id?:string,
        public qty?: number
    ){}

    /** ================================================================
    *   GET IMAGE
    ==================================================================== */    
    get getImage(){        
        
        if (this.img) {            
            return `${base_url}/uploads/department/${this.img}`;
        }else{
            return `${base_url}/uploads/department/no-image`;
        }
    }

}

export class ListDepartamento{

    constructor(
        public department: string
    ){}

}