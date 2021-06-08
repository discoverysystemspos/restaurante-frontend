import { _cajero } from './load-caja.interface';
import { LogProductsModel } from '../models/log-products';
// 

export interface LoadLogProducts {

    ok: boolean;
    products: LogProductsModel[];
    total: number

}