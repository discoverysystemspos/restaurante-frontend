import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

// MODELS
import { Client } from '../models/client.model';

// INTERFACES
import { LoadClients } from '../interfaces/load-clients.interface';

import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  public client: Client;

  constructor( private http: HttpClient ) { }

  /** ================================================================
   *   GET TOKEN
  ==================================================================== */
  get token():string {
    return localStorage.getItem('token') || '';
  }

  /** ================================================================
   *   GET HEADERS
  ==================================================================== */
  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  /** ================================================================
   *   CARGAR CLIENTES clients
  ==================================================================== */
  cargarClientes(desde: number = 0){
    
    const endPoint = `/clients?desde=${desde}`;
    return this.http.get<LoadClients>(`${base_url}${endPoint}`, this.headers)
            .pipe(
              delay(500),
              map( resp => {
                return resp;
              })
            );

  }

  /** ================================================================
   *   CREATE CLIENT
  ==================================================================== */
  createClient( formData: any ){
    
    return this.http.post(`${base_url}/clients`, formData, this.headers);

  }

  /** ================================================================
   *   UPDATE CLIENT
  ==================================================================== */
  updateClient(formData:any, _id:string){
    return this.http.put(`${base_url}/clients/${_id}`, formData, this.headers);
  }


  /** ================================================================
   *   DELETE CLIENT
  ==================================================================== */
  deleteClient( _id: string){
    return this.http.delete(`${base_url}/clients/${_id}`, this.headers);
  }
                
}
