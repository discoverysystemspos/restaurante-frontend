import { environment } from "../../environments/environment"

// MODELS
import { Kit } from "./kits.model";
import { Department } from './department.model';
import { Impuesto } from './impuesto.model';

const base_url = environment.base_url;


export class Product {

    constructor(
        public code: string,
        public name: string,
        public type: string,
        public cost: number,
        public gain: number,
        public price: number,
        public wholesale: number,
        public kit?: Kit[],
        public department?: Department,
        public stock?: number,
        public min?: number,
        public max?: number,
        public bought?: number,
        public sold?: number,
        public returned?: number,
        public damaged?: number,
        public img?: string,
        public expiration?: Date,
        public status?: boolean,
        public pid?: string,
        public visibility?: boolean,
        public low?: boolean,
        public out?: boolean,
        public vencido?: boolean,
        public description?: string,
        public comanda?: boolean,
        public tipo?: string,
        public tax?: boolean,
        public taxid?: any,
        public impuesto?: Impuesto[],
        public inventario?: number,
    ){}

    /** ================================================================
    *   GET IMAGE
    ==================================================================== */    
    get getImage(){
        
        if (this.img) {            
            return `${base_url}/uploads/products/${this.img}`;
        }else{
            return `${base_url}/uploads/products/no-image`;
        }
    }

};