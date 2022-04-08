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
   *  CREATE PEDIDOS
  ==================================================================== */
  createPedidos(formData : any, cid: string, mesaID: string){

    return this.http.post(`${base_url}/pedidos?local=true&cid=${cid}&mesa=true&mid=${mesaID}`, formData, this.headers);
  }

  /** ================================================================
   *  LOAD PEDIDOS
  ==================================================================== */
  loadPedidos(query: string = ''){

    return this.http.get<LoadPedido>(`${base_url}/pedidos?${query}`, this.headers)
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

  /** ================================================================
   *   ACTUALIZAR PEDIDO
  ==================================================================== */
  actualizarEstatusPedido(formData:any, _id:string){
    return this.http.put(`${base_url}/pedidos/${_id}`, formData, this.headers);
  }

  /** ================================================================
   *   DELETE PEDIDO
  ==================================================================== */
  deletePedidos( _id: string){
    return this.http.delete(`${base_url}/pedidos/${_id}`, this.headers);
  }


  // FIN DE LA CLASE
}
