import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Banco } from '../models/bancos.model';
import { LoadBancos } from '../interfaces/load-bancos.interface';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class BancosService {

  constructor(  private http:HttpClient) { }

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
   *  CREATE BANCOS
  ==================================================================== */
  createBanco(formData: any){
    
    return this.http.post<{ok: boolean, banco: Banco}>(`${base_url}/bancos`, formData, this.headers);

  }

  /** ================================================================
   *  LOAD BANCOS
  ==================================================================== */
  loadBancos(){
    
    return this.http.get<LoadBancos>(`${base_url}/bancos`, this.headers)
                .pipe(
                  map( resp => {
                      return resp;
                    })
                )

  }

  /** ================================================================
   *  LOAD BANCO ID
  ==================================================================== */
  loadBancoId( banco: string ){

    return this.http.get(`${base_url}/bancos/${banco}`, this.headers)
                .pipe(
                  map( (resp: { ok: boolean, banco: Banco}) =>{
                    return resp.banco
                  })
                )

  }

  /** ================================================================
   *  UPDATE BANCO
  ==================================================================== */
  updateBanco(formData: any, id: string){
    
    return this.http.put<{ok: boolean, banco: Banco}>(`${base_url}/bancos/${id}`, formData, this.headers);

  }

  /** ================================================================
   *  UPDATE ESTATUS BANCO
  ==================================================================== */
  statusUpdateBanco(id: string){
    
    return this.http.delete<{ok: boolean, banco: Banco}>(`${base_url}/bancos/${id}`, this.headers)
                .pipe(
                  map( (resp: {ok: boolean, banco: Banco}) => { 
                    return resp.banco 
                  })
                );

  }

  // FIN DE LA CLASE
}
