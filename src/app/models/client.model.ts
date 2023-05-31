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
        public credit?: boolean,
        public mayoreo?: boolean,
        public contratista?: boolean,
        public codigoDepartamento?: string,
        public codigoCiudad?: string,
        public sendemail?: boolean,
        public party_type?: 'PERSONA_JURIDICA' | 'PERSONA_NATURAL',
        public tax_level_code?: 'SIMPLIFICADO' | 'RESPONSABLE_DE_IVA' | 'NO_RESPONSABLE_DE_IVA' | 'COMUN',
        public country_code?: string,
        public first_name?: string,
        public party_identification_type?: 'TE' | 'PEP' | 'TI' | 'RC' | 'CC' | 'CE' | 'PASAPORTE' | 'IE' | 'NIT_OTRO_PAIS' | 'NIT',
        public company_name?: string,
        public family_name?: string,
        public regimen?: 'AUTORRETENEDOR' | 'AGENTE_RETENCION_IVA' | 'ORDINARIO' | 'SIMPLE' | 'GRAN_CONTRIBUYENTE',
        public party_identification?: string,
        public codigodepartamento?: string,
        public codigociudad?: string,

    ){}
    

};