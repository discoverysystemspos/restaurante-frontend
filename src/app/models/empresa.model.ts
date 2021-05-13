
import { environment } from "../../environments/environment"

const base_url = environment.base_url;

export class Datos{

    constructor(
        public name:string,
        public address: boolean,
        public phone: string,
        public nit:string,
        public printpos: boolean,
        public tax?: number,
        public logo?:string,
        public eid?:string,
        public fecha?:Date,
        public status?:string,
        public impuesto?: boolean,
        public pos?: boolean,
        public responsable?: boolean,
        public impuestoconsumo?: boolean,
        public resolucion?: string,
        public prefijopos?: string,
        public tip?: boolean,
        public propina?: number,
        public commission?: boolean,
        public comision?: number,
        public bascula?: boolean,
    ){}

    /** ================================================================
    *   GET IMAGE
    ==================================================================== */    
    get getImage(){        
        
        if (this.logo) {            
            return `${base_url}/uploads/logo/${this.logo}`;
        }else{
            return `${base_url}/uploads/logo/no-image`;
        }
    }

}