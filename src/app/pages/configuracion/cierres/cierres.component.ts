import { Component, OnInit } from '@angular/core';

// SERVICES
import { TurnoService } from '../../../services/turno.service';
import { SearchService } from '../../../services/search.service';

// INTERFACES
import { LoadTurno, _movements } from '../../../interfaces/load-turno.interface';

@Component({
  selector: 'app-cierres',
  templateUrl: './cierres.component.html',
  styles: [
  ]
})
export class CierresComponent implements OnInit {

  public listaTurnos: LoadTurno[] = [];
  public listaTurnosTemp: LoadTurno[] = [];
  public totalTurnos: number = 0;

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private turnoService: TurnoService,
                private searchService: SearchService) { }

  ngOnInit(): void {

    // CARGAR TURNOS
    this.cargarTurno();
  }

  /** ===============================================================
  * CARGAR TURNO  
  ==================================================================== */
  public turno: LoadTurno;
  cargarTurno(){  
    this.turnoService.loadTurno(this.desde)
    .subscribe( ({turnos, total}) => {       
      
      // COMPROBAR SI EXISTEN RESULTADOS
      if (turnos.length === 0) {
        this.sinResultados = false;
        this.cargando = false;
        this.listaTurnos = [];
        this.resultado = 0;
        this.btnAtras = 'disabled';
        this.btnAdelante = 'disabled';
        return;                
      }
      // COMPROBAR SI EXISTEN RESULTADOS

      this.totalTurnos = total;
      this.listaTurnos = turnos;
      this.listaTurnosTemp = turnos;
      this.resultado = 0;
      this.cargando = false;

      // BOTONES DE ADELANTE Y ATRAS          
      if (this.desde === 0 && this.totalTurnos > 10) {
        this.btnAtras = 'disabled';
        this.btnAdelante = '';
      }else if(this.desde === 0 && this.totalTurnos < 11){
        this.btnAtras = 'disabled';
        this.btnAdelante = 'disabled';
      }else if(this.desde > this.listaTurnos.length){
        this.btnAtras = '';
        this.btnAdelante = 'disabled';
      }else if((this.desde + 10) >= this.totalTurnos){
        this.btnAtras = '';
        this.btnAdelante = 'disabled';
      }else{
        this.btnAtras = '';
        this.btnAdelante = '';
      }   
      // BOTONES DE ADELANTE Y ATRAS  
      
    });
  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  cambiarPagina (valor: number){
    this.desde += valor;

    if (this.desde < 0) {
      this.desde = 0;
    }else if( this.desde > this.totalTurnos ){
      this.desde -= valor;
    }

    this.cargarTurno();

  }

  /** ===============================================================
  * BUSCAR TURNO  
  ==================================================================== */
  buscar(termino: Date){
    
    this.sinResultados = true;
    
    if (termino === null) {
      this.listaTurnos = this.listaTurnosTemp;
      this.resultado = 0;
      return;
    }else{

      if (!termino) {
        this.listaTurnos = this.listaTurnosTemp;
        this.resultado = 0;
        return;
      }

      this.sinResultados = true;
      this.turnoService.loadTurnoDate(termino)
          .subscribe(({total, turnos}) => {

            // COMPROBAR SI EXISTEN RESULTADOS
            if (turnos.length === 0) {
              this.sinResultados = false;
              this.listaTurnos = [];
              this.resultado = 0;
              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS

            this.totalTurnos = total;
            this.listaTurnos = turnos; 
            this.resultado = turnos.length; 

          });
          
    }

  }

  /** ===============================================================
  * TURNO - TURNO - TURNO - TURNO  
  ==================================================================== */
  public turnoId: LoadTurno;
  cargarTurnoId(id:string){

    this.movimientos = [];
    this.inicial = 0;

    this.turnoService.getTurnoId(id)
    .subscribe( (turno) => { 
      this.turnoId = turno;
      this.movimientos = turno.movements;
      this.inicial = turno.initial;
      
      this.procesarInformacion();
      
    });
  }
  
  /** ===============================================================
  * PROCESAR LA INFORMACION 
  ==================================================================== */
  public efectivo: number = 0;
  public tarjeta: number = 0;
  public credito: number = 0;
  public vales: number = 0;
  public transferencia: number = 0;
  public inicial: number = 0;
  public abEfectivo: number = 0;
  public entradas: number = 0;
  public salidas: number = 0;
  public montoDiferencia: number = 0;
  public movimientos: _movements[] = [];
  
  procesarInformacion(){

    this.efectivo = 0;
    this.tarjeta = 0;
    this.credito = 0;
    this.vales = 0;
    this.transferencia = 0;
    this.inicial = 0;
    this.abEfectivo = 0;
    this.entradas = 0;
    this.salidas = 0;
    this.montoDiferencia = 0;
    
    // TOTALIZAR VENTAS
    const sales = this.turnoId.sales;
    for (let i = 0; i < sales.length; i++) {
      
      //  COMPROBAR EL ESTADO DE LA FACTURA
      if (sales[i].facturas.status) {

        let pagos = sales[i].facturas.payments;
        for (let i = 0; i < pagos.length; i++) {
          switch (pagos[i].type) {
            case 'efectivo':

              this.efectivo += pagos[i].amount;
              
              break;

            case 'tarjeta':
              
              this.tarjeta += pagos[i].amount;
              
              break;

            case 'credito':

              this.credito += pagos[i].amount;
              
              break;
            
            case 'vales':

              this.vales += pagos[i].amount;
              
              break;
            
            case 'transferencia':

              this.transferencia += pagos[i].amount;
              
              break;
          
            default:
              break;
          }
          
        }

      }
      
    }
    // TOTALIZAR VENTAS

    // TOTALIZAR MOVIMIENTOS
    const movements = this.movimientos;
    for (let i = 0; i < movements.length; i++) {
      
      switch (movements[i].type) {
        case 'entrada':

          this.entradas += movements[i].monto;
          
          break;

        case 'salida':

          this.salidas += movements[i].monto;
          
          break;
      
        default:
          break;
      }
      
    }
    // TOTALIZAR MOVIMIENTOS

    // VERIFICAR SI TIENE DIFERENCIA
    if (this.turnoId.diferencia) {
      this.montoDiferencia = this.turnoId.montoD;      
    }    
    // VERIFICAR SI TIENE DIFERENCIA

  }


  // FIN DE LA CLASE
}
