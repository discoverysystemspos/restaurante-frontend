import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

// INTERFACES
import { LoadCaja, _caja } from '../interfaces/load-caja.interface';

// CAJA
import { Caja } from '../models/caja.model';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  constructor(private http: HttpClient) { }

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
   *  CREATE CAJA
  ==================================================================== */
  createCaja(formData: Caja){
    
    return this.http.post(`${base_url}/caja`, formData, this.headers);

  }

  /** ================================================================
   *  LOAD CAJAS
  ==================================================================== */
  loadCajas(){
    
    return this.http.get<LoadCaja>(`${base_url}/caja`, this.headers)
                .pipe(
                  map( resp => {
                      return resp;
                    })
                )

  }

  /** ================================================================
   *  LOAD ONE CAJA
  ==================================================================== */
  loadOneCaja( turno: string ){

    return this.http.get(`${base_url}/caja/turno/${turno}`, this.headers)
                .pipe(
                  map( (resp: { ok: boolean, caja: Caja}) =>{
                    return resp.caja
                  })
                )

  }

  /** ================================================================
   *  UPDATE CAJA
  ==================================================================== */
  updateCaja(formData: any, id: string){
    
    return this.http.put(`${base_url}/caja/${id}`, formData, this.headers);

  }

  /** ================================================================
   *  UPDATE ESTATUS CAJAS
  ==================================================================== */
  statusUpdateCaja(id: string){
    
    return this.http.delete(`${base_url}/caja/${id}`, this.headers)
                .pipe(
                  map( (resp: {ok: boolean, caja: Caja}) => { 
                    return resp.caja 
                  })
                );

  }




  // FIN DE LA CLASE
}
