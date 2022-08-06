import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

// MODEL

// INTERFACES

import { environment } from '../../environments/environment';
import { LoadEntradas } from '../interfaces/load-entradas.interface';
import { Entradas } from '../models/entradas.model';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class EntradasService {

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
   *  GET TURNOS
  ==================================================================== */
  loadMovimientos(desde: number = 0, hasta: number = 50){        
    return this.http.get<LoadEntradas>(`${base_url}/movimientos?desde=${desde}&hasta=${hasta}`, this.headers)
                .pipe(
                  map( resp => {
                    return resp;
                  })
                );
  }

  /** ================================================================
   *  LOAD MOVIMIENTOS DATE
  ==================================================================== */
  loadMovimientosDate(initial: Date, end: Date, tipo: string = 'none'){
    const endpoint = `${base_url}/movimientos/date?initial=${initial}&end=${end}&tipo=${tipo}`  
    return this.http.get<LoadEntradas>(`${endpoint}`, this.headers)
                .pipe(
                  map( resp => {
                    return resp;
                  })
                );
  }

  /** ================================================================
   *  CREATE MOVIMIENTO
  ==================================================================== */
  createMovimiento( formData: any ){

    return this.http.post<{ movimiento: Entradas, ok: boolean }>(`${base_url}/movimientos`, formData, this.headers);

  }


  // FIN DE LA CLASE
}
