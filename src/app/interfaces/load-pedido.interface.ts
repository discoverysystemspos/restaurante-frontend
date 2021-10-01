import { Pedido } from '../models/pedido.models';

export interface LoadPedido{
    ok: boolean;
    pedidos: Pedido[];
    total: number;
}