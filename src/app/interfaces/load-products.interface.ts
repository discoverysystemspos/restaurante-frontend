import { Product } from '../models/product.model';

export interface LoadProduct{
    total: number;
    products: Product[];
}

export interface LoadCost{
    costo: number;
    precio: number;
    inventario: number;
}