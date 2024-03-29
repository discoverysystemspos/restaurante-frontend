import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { DataicoInterface } from '../interfaces/dataico.interface';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class DataicoService {

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
   *  LOAD DATA DATAICO
  ==================================================================== */
  loadDataDataico(){    
    return this.http.get<{dataico: DataicoInterface, ok: boolean}>(`${base_url}/dataico`, this.headers);
  }

  /** ================================================================
   *  POST DATAICO
  ==================================================================== */
  postDataico(formData: any){
    return this.http.post<{dataico: DataicoInterface, ok: boolean}>(`${base_url}/dataico`, formData, this.headers);
  }

  /** ================================================================
   *  POST DATAICO
  ==================================================================== */
  updateDataico(formData: any, id: string){
    return this.http.put<{dataico: DataicoInterface, ok: boolean}>(`${base_url}/dataico/${id}`, formData, this.headers);
  }


  // FIN DE LA CLASE
}
