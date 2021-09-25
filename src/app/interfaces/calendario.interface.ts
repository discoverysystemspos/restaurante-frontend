import { Calendario } from "../models/calendario.model";

export interface LoadCalendario{
    ok: boolean;
    calendarios: Calendario[];
    total: number;
}