import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

// MODELS
import { Pedido } from '../models/pedido.models';


// INTERFACES
import { LoadPedido } from '../interfaces/load-pedido.interface';

import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  public pedido: Pedido;

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
   *  LOAD PEDIDOS
  ==================================================================== */
  loadPedidos(){

    return this.http.get<LoadPedido>(`${base_url}/pedidos`, this.headers)
        .pipe(
          map( resp =>{
            return resp;
          })
        );
        
  }

  /** ================================================================
   *  LOAD PEDIDOS /one/:id
  ==================================================================== */
  loadPedidoOne(id: string){

    return this.http.get(`${base_url}/pedidos/one/${id}`, this.headers)
        .pipe(
          map( (resp: {ok: boolean, pedido: Pedido}) =>{
            return resp;
          })
        );
        
  }


  // FIN DE LA CLASE
}
