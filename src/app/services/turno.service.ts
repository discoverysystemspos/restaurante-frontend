import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

// INTERFACE
import { LoadTurno, LoadsTurnos } from '../interfaces/load-turno.interface';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class TurnoService {

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
   *  CREATE NEW TURNO
  ==================================================================== */
  createCaja(formData: any){
    
    return this.http.post(`${base_url}/turno`, formData, this.headers);

  }
  /** ================================================================
   *  GET TURNOS
  ==================================================================== */
  loadTurno(desde: number = 0){        
    return this.http.get<LoadsTurnos>(`${base_url}/turno?desde=${desde}`, this.headers)
                .pipe(
                  map( resp => {
                    return resp;
                  })
                );
  }

  /** ================================================================
   *  GET TURNO DATE
  ==================================================================== */
  loadTurnoDate(initial: Date, end: Date, user: string = 'none'){
    const endpoint = `${base_url}/turno/date?initial=${initial}&end=${end}&user=${user}`  
    return this.http.get<LoadsTurnos>(`${endpoint}`, this.headers)
                .pipe(
                  map( resp => {
                    return resp;
                  })
                );
  }

  /** ================================================================
   *  GET TURNO ID
  ==================================================================== */
  getTurnoId(turno: string){
        
    return this.http.get(`${base_url}/turno/${turno}`, this.headers)
                .pipe(
                  map( (resp: {ok:boolean, turno: LoadTurno}) => {
                    return resp.turno;
                  })
                );
  }

  /** ================================================================
   *  UPDATE TURNO
  ==================================================================== */
  updateTurno(body: any, _id: string){

    return this.http.put(`${base_url}/turno/${_id}`, body, this.headers);

  }


  // FIN DE LA CLASE
}
