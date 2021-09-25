import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

// MODEL

// INTERFACES
import { LoadCalendario } from '../interfaces/calendario.interface';

import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {

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
   *  LOAD CALENDARIO
  ==================================================================== */
  loadCalendario(){

    return this.http.get<LoadCalendario>(`${base_url}/calendario`, this.headers)
        .pipe(
          map( resp =>{
            return resp;
          })
        );
        
  }

  /** ================================================================
   *  CREATE CALENDARIO
  ==================================================================== */
  createCalendario(formData: any){
    
    return this.http.post(`${base_url}/calendario`, formData, this.headers);

  }



  // FIN DE LA CLASE
}
