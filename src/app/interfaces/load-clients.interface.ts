import { Client } from '../models/client.model';

export interface LoadClients{
    total: number;
    clients: Client[];
}