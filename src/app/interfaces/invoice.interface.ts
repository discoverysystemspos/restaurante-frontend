// MODELS
import { Client } from '../models/client.model';

// INTERFACES
import { _payments, _paymentsCredito } from './carrito.interface';

// MODELS
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Impuesto } from '../models/impuesto.model';
import { _devolucion } from './load-turno.interface';

// INTERFACES INVOICE
export interface _products{
    product: Product;
    qty: number;
    price: number;
    _id: string;
}

interface _client{
    cedula: string;
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
    descuento: boolean;
    porcentaje: number;
    paymentsCredit: _paymentsCredito[],
    devolucion: _devolucion[]

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
