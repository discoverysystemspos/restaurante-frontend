// MODELS
import { Client } from '../models/client.model';

// INTERFACES
import { _payments, _paymentsCredito } from './carrito.interface';

// MODELS
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Impuesto } from '../models/impuesto.model';
import { _devolucion } from './load-turno.interface';
import { _images } from '../models/invoice.model';

// INTERFACES INVOICE
export interface _products{
    product: Product;
    qty: number;
    price: number;
    _id: string;
    mayor: boolean;
}

interface _client{
    cedula: string;
    party_type?: 'PERSONA_JURIDICA' | 'PERSONA_NATURAL';
    tax_level_code?: 'SIMPLIFICADO' | 'RESPONSABLE_DE_IVA' | 'NO_RESPONSABLE_DE_IVA' | 'COMUN';
    country_code?: string;
    first_name?: string;
    party_identification_type?: 'TE' | 'PEP' | 'TI' | 'RC' | 'CC' | 'CE' | 'PASAPORTE' | 'IE' | 'NIT_OTRO_PAIS' | 'NIT';
    company_name?: string;
    family_name?: string;
    regimen?: 'AUTORRETENEDOR' | 'AGENTE_RETENCION_IVA' | 'ORDINARIO' | 'SIMPLE' | 'GRAN_CONTRIBUYENTE';
    party_identification?: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    department?: string;
    zip?: string;
    status?: string;
    fecha?: string;
    cid?: string;
    codigodepartamento?: string;
    codigociudad?: string;
    sendemail?: boolean;
}

export interface _mesa{
    name: string;
    id?: string
}


export interface LoadInvoice {
        
    invoice: number;
    control: number;
    client: _client;
    mesero: User;
    mesa: {
        name: string;
        id?: string
    };
    user: User;
    products: _products[];
    type: string;
    amount: number;
    totalAbonado: number;
    payments: _payments[];
    credito: boolean;
    fechaCredito: Date;
    status: boolean;
    fecha: Date;
    iid: string;
    tax: boolean;
    impuesto: Impuesto;
    iva: number;
    base: number;
    pago: number;
    cost: number;
    vueltos: number;
    nota: string;
    apartado: boolean;
    marca: boolean;
    descuento: boolean;
    porcentaje: number;
    paymentsCredit: _paymentsCredito[];
    devolucion: _devolucion[];
    pdf_url: string;
    uuid: string;
    cufe: string;
    tip: number;
    electronica: boolean;
    mayor: boolean;
    number: string;
    send: boolean;
    totalItems: number;
    paymentsAlquiler?: _paymentsCredito[];
    _id?:string;
    placa?:string;
    images?:_images[];

}

export interface ListInvoice {
    total: number;
    invoices: LoadInvoice[];
    montos?: number;
    costos?: number;
    cost?: number;
    efectivo: number;
    tarjeta?: number;
    transferencia?: number;
    credit?: number;
    creditos?: number;
    propinas?: number;
    vales?: number;
    devolucion?: number;
    iva?: number;
}

export interface ListCreditoCliente{
    ok: boolean;
    invoices: LoadInvoice[];
}

export interface CargarFactura {
    ok: boolean;
    invoice: LoadInvoice;
}
