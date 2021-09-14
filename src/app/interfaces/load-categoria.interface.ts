import { Categoria } from '../models/categoria.model';

export interface LoadCategoria{
    categorias: Categoria[];
    total: number;
}