import { Component, OnInit } from '@angular/core';

// MODEL
import { Entradas } from 'src/app/models/entradas.model';

// SERVICES
import { EntradasService } from 'src/app/services/entradas.service';

@Component({
  selector: 'app-entradas-salidas',
  templateUrl: './entradas-salidas.component.html',
  styles: [
  ]
})
export class EntradasSalidasComponent implements OnInit {

  constructor(  private entradasService: EntradasService) { }

  ngOnInit(): void {

    // CARGAR MOVIMIENTOS
    this.cargarMovimientos();

  }

  /** ================================================================
   *   CARGAR LOG PRODUCTOS
  ==================================================================== */
  public desde: number = 0;
  public hasta: number = 50;
  public total: number = 0;
  cargarMovimientos(){

    this.cargando = true;

    this.entradasService.loadMovimientos(this.desde, this.hasta)
        .subscribe( ({movimientos, total}) => {

          console.log(movimientos);
          

          // COMPROBAR SI EXISTEN RESULTADOS
          if (movimientos.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.movimientos = [];
            this.resultado = 0;
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS
          
          this.total = total;
          this.movimientos = movimientos;
          this.movimientosTemp = movimientos;
          this.resultado = 0;
          this.cargando = false;
          this.sinResultados = true;

          // BOTONOS DE ADELANTE Y ATRAS          
          // if (this.desde === 0 && this.total > this.limite) {
          //   this.btnAtras = 'disabled';
          //   this.btnAdelante = '';
          // }else if(this.desde === 0 && this.total < (this.limite + 1)){
          //   this.btnAtras = 'disabled';
          //   this.btnAdelante = 'disabled';
          // }else if( this.desde >= this.total){
          //   this.btnAtras = '';
          //   this.btnAdelante = 'disabled';
          // }else{
          //   this.btnAtras = '';
          //   this.btnAdelante = '';
          // }   
          // BOTONOS DE ADELANTE Y ATRAS

          for (const log of movimientos) {

            if (log.type === 'entrada') {
              
              this.totalEntrada += log.monto || 0;
            }else{
              
              this.totalSalida += log.monto || 0;
            }

          }

        });

  }

  /** ================================================================
   *   BUSCAR POR FECHA
  ==================================================================== */
  public cargando: boolean = true;
  public monto: number = 0;
  public totalEntrada: number = 0;
  public totalSalida: number = 0;
  public resultado: number = 0;
  public sinResultados: boolean = false;
  public movimientos: Entradas[] = [];
  public movimientosTemp: Entradas[] = [];

  buscarPor(inicial:Date, final: Date, tipo: string = 'none'){

    this.monto = 0;
    this.sinResultados = true;

    if(tipo === 'none' && inicial === null && final === null){
      this.movimientos = this.movimientosTemp;
      this.resultado = 0;
      return;
    }

    // SET HOURS      
    inicial = new Date(inicial);      
    const initial = new Date(inicial.getTime());

    final = new Date(final);
    const end = new Date(final.getTime());      
    // SET HOURS 

    this.entradasService.loadMovimientosDate(initial, end, tipo)
        .subscribe( ({movimientos}) => {

          // COMPROBAR SI EXISTEN RESULTADOS
          if (movimientos.length === 0) {
            this.sinResultados = false;
            this.movimientos = [];
            this.resultado = 0;
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          for (const log of movimientos) {
            this.monto += log.monto || 0;
          }   

          this.movimientos = movimientos; 
          this.resultado = movimientos.length;
          
        });

  }


  // FIN DE LA CLASE
}
