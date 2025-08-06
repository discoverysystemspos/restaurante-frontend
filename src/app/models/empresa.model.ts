
import { environment } from "../../environments/environment"

const base_url = environment.base_url;

export interface comisiones{
    activo: boolean,
    monto: number,
    comision: number,
    _id?: string,
};

export interface header{
    texto: string,
    bold: boolean,
    size: number
}

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
        public noresponsable?: boolean,
        public impuestoconsumo?: boolean,
        public datafon?: boolean,
        public comidatafon?: number,
        public resolucion?: string,
        public prefijopos?: string,
        public tip?: boolean,
        public propina?: number,
        public commission?: boolean,
        public comision?: number,
        public bascula?: boolean,
        public basculakg?: boolean,
        public fruver?: boolean,
        public comandas?: boolean,
        public commissions?: boolean,
        public comisiones?: comisiones[],
        public header?: string,
        public footer?: string,
        public type?: string,
        public decimal?: boolean,
        public cotizacion?: boolean,
        public usd?: boolean,
        public currencyusd?: number,
        public cop?: boolean,
        public nube?: boolean,
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
        public marca?: boolean,
        public placa?: boolean,
        public taller?: boolean,
        public paiddirect?: boolean,
        public kiosco?: boolean,
        public fechakardex?: Date,
        public min?: number,
        public pais?: string,
        public msgv?: string,
        public notificaciones?: any[],
        public vence?: Date,
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