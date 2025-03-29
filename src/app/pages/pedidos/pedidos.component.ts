import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';

// MODELS
import { Pedido } from '../../models/pedido.models';

// INTERFACES
import { PedidosService } from '../../services/pedidos.service';
import { SearchService } from '../../services/search.service';

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
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private pedidosService: PedidosService,
                private searchService: SearchService) { }

  ngOnInit(): void {
    

    this.cargarPedidos();

  }

  /** ================================================================
   *   CARGAR PEDIDOS
  ==================================================================== */
  @ViewChild('mostrar') mostrar: ElementRef;
  public desde: number = 0;
  public hasta: number = 50;

  cargarPedidos(){
    this.cargando = true;
    this.sinResultados = true;

    let query = `desde=${this.desde}&hasta=${this.hasta}`;

    this.pedidosService.loadPedidos(query)
        .subscribe(({ total, pedidos }) =>{  

          console.log(pedidos);
          
          
          // COMPROBAR SI EXISTEN RESULTADOS
          if (pedidos.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.pedidos = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.totalPedidos = total;
          this.pedidos = pedidos;
          this.pedidosTemp = pedidos;
          this.resultado = 0;
          this.cargando = false;          
          
          // BOTONOS DE ADELANTE Y ATRAS          
          if (this.desde === 0 && this.totalPedidos > 10) {
            this.btnAtras = 'disabled';
            this.btnAdelante = '';
          }else if(this.desde === 0 && this.totalPedidos < 11){
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
          }else if((this.desde + 10) >= this.totalPedidos){
            this.btnAtras = '';
            this.btnAdelante = 'disabled';
          }else{
            this.btnAtras = '';
            this.btnAdelante = '';
          }   
          // BOTONOS DE ADELANTE Y ATRAS 

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); }
        )
  }

  /** ================================================================
   *   BUSCAR PEDIDOS
  ==================================================================== */  
  buscar(termino:string, mostrar:any = 50){    
    
    this.sinResultados = true;
    if (termino.length === 0) {
      this.pedidos = this.pedidosTemp;
      this.resultado = 0;
      return;
    }else{
      
      this.sinResultados = true;

      let query = `hasta=${mostrar}`;
      
      this.searchService.search('pedidos', termino, true, query)
          .subscribe(({total, resultados}) => {
            
            // COMPROBAR SI EXISTEN RESULTADOS
            if (resultados.length === 0) {
              this.sinResultados = false;
              this.pedidos = [];
              this.resultado = 0;

              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS
            
            this.totalPedidos = total;
            this.pedidos = resultados; 
            this.resultado = resultados.length;

            

          }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

    }

  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  cambiarPagina (valor: number){
    
    this.hasta = Number(this.mostrar.nativeElement.value);
    
    if (this.hasta > 10) {
      valor = valor * (this.hasta/10);      
    }

    this.desde += valor;
    
    if (this.desde < 0) {
      this.desde = 0;
    }else if( this.desde > this.totalPedidos ){
      this.desde -= valor;
    }

    this.cargarPedidos();

  }


  // FIN CLASE
}
