import { Product } from '../models/product.model';
import { _products } from './invoice.interface';
import { Kit } from '../models/kits.model';
import { Department } from '../models/department.model';

export interface _payments {
    type: string;
    amount: number;
    description?: string;
}

export interface Carrito{
    qty: number;
    product: string;
    price: number;
    producto?: Product;
    _id?: string;
}

interface _interProducto{

    code: string;
    name: string;
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

}

export interface LoadCarrito{

    qty: number;
    product: _interProducto[];
    price: number;
    _id?: string;

}