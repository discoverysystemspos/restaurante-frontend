// MODELS
import { Client } from '../models/client.model';

// INTERFACES
import { _payments } from './carrito.interface';

// MODELS
import { User } from '../models/user.model';
import { Product } from '../models/product.model';

// INTERFACES INVOICE
export interface _products{
    product: Product;
    qty: number;
    price: number;
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

interface _mesa{
    name: string;
}


export interface LoadInvoice {
        
    invoice: number;
    client: _client;
    mesero: User;
    mesa: _mesa;
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

}

export interface ListInvoice {
    total: number;
    invoices: LoadInvoice[];
}

export interface CargarFactura {
    ok: boolean;
    invoice: LoadInvoice;
}
