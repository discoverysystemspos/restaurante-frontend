
import { Impuestos } from '../models/impuestos.model';

export interface LoadImpuestos{
    taxes: Impuestos[],
    total: number
}