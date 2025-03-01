import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
  public query: any = {
    desde: 0,
    hasta: 50,
    sort: {fecha: -1}
  }

  cargarMovimientos(){

    this.cargando = true;
    this.totalEntrada = 0;
    this.totalSalida = 0;
    

    this.entradasService.loadMovimientosQuery(this.query)
        .subscribe( ({movimientos, total}) => {

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
  public totalEntrada: number = 0;
  public totalSalida: number = 0;
  public resultado: number = 0;
  public sinResultados: boolean = false;
  public movimientos: Entradas[] = [];
  public movimientosTemp: Entradas[] = [];

  buscarPor(inicial:Date, final: Date){

    if (inicial === null && final === null || !inicial || !final) {
      return;
    }

    // SET HOURS      
    inicial = new Date(inicial);      
    let initial = new Date(inicial.getTime() + 1000 * 60 * 60 * 5);

    final = new Date(final);
    let end = new Date(final.getTime() + 1000 * 60 * 60 * 5);      
    // SET HOURS 

    let url = document.URL.split(':');
    if (url[0] === 'https') {
      initial = new Date(inicial.getTime() + 1000 * 60 * 60 - 7200000); 
      end = new Date(final.getTime() + 1000 * 60 * 60 - 3600000);        
    }

    this.query.$and = [{ fecha: { $gte: new Date(initial), $lt: new Date(end) } }];

    this.cargarMovimientos();

  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  @ViewChild('mostrar') mostrar!: ElementRef;
  cambiarPagina (valor: number){
    
    this.query.desde += valor;

    if (this.query.desde < 0) {
      this.query.desde = 0;
    }
    
    this.cargarMovimientos();
    
  }

  /** ================================================================
   *   CHANGE LIMITE
  ==================================================================== */
  limiteChange( cantidad: any ){  

    this.query.hasta = Number(cantidad);    
    this.cargarMovimientos();

  }

  // FIN DE LA CLASE
}
