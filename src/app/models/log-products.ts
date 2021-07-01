import { _cajero } from '../interfaces/load-caja.interface';
import { Invoice } from './invoice.model';
//  Model Caja
export class LogProductsModel{

    constructor(
        public code:string,
        public name?: string,
        public description?: string,
        public type?: string,
        public befored?: number,
        public qty?: number,
        public stock?: number,
        public cajero?: _cajero,
        public fecha?: Date,
        public lpid?: string,
        public invoice?: Invoice
    ){}

}