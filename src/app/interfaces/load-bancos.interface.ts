import { Banco } from "../models/bancos.model";

export interface LoadBancos{

    bancos: Banco[],
    total: number

}