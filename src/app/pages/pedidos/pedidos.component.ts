import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

// MODELS
import { Pedido } from '../../models/pedido.models';

// INTERFACES
import { PedidosService } from '../../services/pedidos.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styles: [
  ]
})
export class PedidosComponent implements OnInit {

  public pedidos: Pedido[] = [];
  public pedidosTemp: Pedido[] = [];
  public totalPedidos: number = 0;
  
  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  constructor(  private pedidosService: PedidosService) { }

  ngOnInit(): void {

    this.cargarPedidos();

  }

  /** ================================================================
   *   CARGAR CATEGORIAS
  ==================================================================== */
  cargarPedidos(){
    this.cargando = true;
    this.sinResultados = true;

    this.pedidosService.loadPedidos()
        .subscribe(({ total, pedidos }) =>{          

          this.totalPedidos = total;
          this.pedidos = pedidos;
          this.pedidosTemp = pedidos;
          this.resultado = 0;
          this.cargando = false;          

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); }
        )
  }


  // FIN CLASE
}
