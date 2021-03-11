import { Product } from '../models/product.model';

export interface LoadProduct{
    total: number;
    products: Product[];
}