import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class BasculaService {

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
   *  LOAD PESO
  ==================================================================== */
  loadPeso(type: string = '1'){

    return this.http.get(`http://localhost:3000/api/bascula?type=${type}`, this.headers)
                .pipe(
                  map( (resp: { ok: boolean, pesos: number})=> {
                      return resp.pesos;
                    })
                )

  }

}
