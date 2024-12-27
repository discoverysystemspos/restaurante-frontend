import { Product } from '../models/product.model';
import { _products } from './invoice.interface';
import { Kit } from '../models/kits.model';
import { Department } from '../models/department.model';

export interface _payments {
    type: string;
    amount: number;
    description?: string;
    fecha?: Date;
}

export interface _paymentsCredito {
    type: string;
    amount: number;
    description?: string;
    turno?: string;
    fecha?: Date;
    _id?: string
}

export interface _notas{
    nota: string;
    date?: Date;
}

export interface Carrito{
    qty: number;
    product: any;
    price: number;
    mayor: boolean 
    producto?: Product;
    _id?: string;
    iva?: number;
    estado?: string;
    tax?: boolean; 
    inventario?: number;
}

interface _interProducto{
    name: string;
    code: string;
    type: string;
    cost: number;
    gain: number;
    price: number;
    wholesale: number;
    kit?: Kit[];
    department?: Department;
    stock?: number;
    min?: number;
    max?: number;
    bought?: number;
    sold?: number;
    returned?: number;
    damaged?: number;
    img?: string;
    expiration?: Date;
    status?: boolean;
    pid?: string;
    visibility?: boolean;
    comanda?: boolean;
    tipo?: string;
    taxid?: any;
    _id?: string
}

export interface LoadCarrito{
    qty: number;
    product: _interProducto;
    price: number;
    mayor?: boolean;
    _id?: string;
    name?: string;
    comanda?: boolean;
    tipo?: string;
    iva?: number;
    estado?:string;
    tax?: boolean; 
    inventario?:number;
}