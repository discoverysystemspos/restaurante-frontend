import { Actions, Customer, Numbering } from "../models/invoiceelectronic.model";

export interface DataicoInterface{
        
    invoice_type_code: 'FACTURA_VENTA' | 'FACTURA_EXPORTACION' | 'FACTURA_CONTINGENCIA';
    actions: Actions;
    authtoken: string;
    dataico_account_id: string;
    customer: Customer;
    numbering: Numbering;
    env: 'PRUEBAS' | 'PRODUCCION';
    operation: 'ESTANDAR' | 'AIU' | 'MANDATO' | 'EXPORTACION' | 'SS_RECAUDO' | 'SS_CUFE' | 'SS_CUDE' | 'SS_POS' | 'SS_NUM' | 'SS_REPORTE' | 'SS_SIN_APORTE';
    datid?: string;
    desde?: number;
    hasta?: number;
    department?: string;
    city?: string;
    email?: string;
    phone?: string;
}