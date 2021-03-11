import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

// MODELS
import { Mesa } from '../models/mesas.model';

// INTERFACES
import { LoadMesas, LoadMesaId } from '../interfaces/load-mesas.interface';

@Injectable({
  providedIn: 'root'
})
export class MesasService {

  constructor(  private http: HttpClient) { }

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
   *   CREATE MESA
  ==================================================================== */
  createMesa(formData: Mesa){

    return this.http.post(`${base_url}/mesas`, formData, this.headers);

  }

  /** ================================================================
   *   LOAD MESAS
  ==================================================================== */
  loadMesas(desde: number = 0){
    const endPoint = `/mesas?desde=${desde}`;
    return this.http.get<LoadMesas>(`${base_url}${endPoint}`, this.headers)
                .pipe(
                  delay(500),
                  map( resp => { return resp; })
                );

  }

  /** ================================================================
   *   LOAD MESA ID
  ==================================================================== */
  loadMesaId(id: string){

    return this.http.get(`${base_url}/mesas/${id}`, this.headers)
                .pipe(
                  map( (resp: { ok: boolean, mesa: any  }) => 
                  { return resp.mesa; } )
                );

  }

  /** ================================================================
   *   UPDATE MESA ID
  ==================================================================== */
  updateMesa(data: any, id: string){
    return this.http.put(`${base_url}/mesas/${id}`, data, this.headers);
  }


}
