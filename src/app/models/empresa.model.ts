
import { environment } from "../../environments/environment"

const base_url = environment.base_url;

export interface comisiones{
    activo: boolean,
    monto: number,
    comision: number,
    _id?: string,
};

export class Datos{

    constructor(
        public name:string,
        public address: boolean,
        public phone: string,
        public nit:string,
        public printpos: boolean,
        public impuesto: boolean,
        public moneda?: string,
        public tax?: number,
        public logo?:string,
        public eid?:string,
        public fecha?:Date,
        public status?:string,
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
        public fruver?: boolean,
        public comandas?: boolean,
        public commissions?: boolean,
        public comisiones?: comisiones[],
        public decimal?: boolean,
        public usd?: boolean,
        public currencyusd?: number,
        public cop?: boolean,
        public bs?: boolean,
        public currencybs?: number,
        public currencycop?: number,
        public basculaimp?: boolean,
        public basculatype?: string,
        public basculacode?: string,
        public electronica?: boolean,
        public alquileres?: boolean,
        public parqueadero?: boolean,
        public domi?: boolean,
        public fechakardex?: Date,
        public min?: number,
        public impresora?: number,
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