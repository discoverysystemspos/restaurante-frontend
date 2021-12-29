import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { delay, map } from 'rxjs/operators';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class SearchService {

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
   *   SEARCH
  ==================================================================== */
  search(
      tipo: 'users'|'clients' |'departments'|'products' |'caja' |'mesa' |'turno'|'log' | 'categorias',
      termino: string,
      status: boolean = false
    ){

    const endPoint = `/search/${tipo}/${termino}&status=${status}`;
    return this.http.get<any[]>(`${base_url}${endPoint}`, this.headers)
            .pipe(
              map( (resp: any) => {              
                return resp;
              })
            );
  }


}
