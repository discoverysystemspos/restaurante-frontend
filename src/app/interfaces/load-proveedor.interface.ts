import { Proveedor } from '../models/proveedor.model';


export interface LoadProveedores{
    total: number;
    proveedores: Proveedor[];
}