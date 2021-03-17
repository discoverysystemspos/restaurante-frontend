import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// SERVICES
import { TurnoService } from '../../services/turno.service';
import { CajaService } from '../../services/caja.service';

// INTERFACES
import { LoadTurno, _movements } from '../../interfaces/load-turno.interface';
import { _caja } from '../../interfaces/load-caja.interface';

// MODELS
import { Caja } from '../../models/caja.model';

@Component({
  selector: 'app-corte',
  templateUrl: './corte.component.html',
  styles: [
  ]
})
export class CorteComponent implements OnInit {

  constructor(  private turnoService: TurnoService,
                private cajaService: CajaService,
                private router: Router) { }

  ngOnInit(): void {    

    if (localStorage.getItem('turno') !== null) {
      
      // TURNO
      this.cargarTurno();
  
      // CAJA
      this.cargarCaja();

    }else{
      Swal.fire('Atención!', 'No existe un turno asignado, no puedes hacer cortes ni cierres', 'info');
      return;
    }

  }

  /** ===============================================================
  * CAJA - CAJA - CAJA - CAJA  
  ==================================================================== */
  public caja: Caja;
  cargarCaja(){

    this.cajaService.loadOneCaja(localStorage.getItem('turno'))
        .subscribe( (caja) => {

          this.caja = caja;      

        }, (err) => { Swal.fire('Error', err.error.msg, 'error') });

  }

  /** ===============================================================
  * TURNO - TURNO - TURNO - TURNO  
  ==================================================================== */
  public turno: LoadTurno;
  cargarTurno(){  
    this.turnoService.getTurnoId(localStorage.getItem('turno'))
    .subscribe( (turno) => { 
      this.turno = turno;
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
  public movimientos: _movements[] = [];
  
  procesarInformacion(){
    
    // TOTALIZAR VENTAS
    const sales = this.turno.sales;
    
    
    for (let i = 0; i < sales.length; i++) {      

      if (sales[i].facturas.payments  === null) {
        return;
      }

      // COMPROBAR QUE LA FACTURA ES TRUE
      if(sales[i].facturas.status){

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

  }

  /** ===============================================================
  * CERRAR CAJA Y TURNO 
  ==================================================================== */
  cerrarTurno(dineroCaja: number){

    const totalEfectivo = (this.efectivo + this.entradas + this.inicial + this.abEfectivo + this.salidas);

    if (Number(dineroCaja) !== totalEfectivo) {
      this.turno.diferencia = true;
      this.turno.montoD = Number(dineroCaja) - totalEfectivo;
    }

    this.turno.cerrado = true;
    this.turno.cierre = new Date();

    // CERRAR TURNO
    this.turnoService.updateTurno(this.turno, this.turno.tid)
        .subscribe( resp => {     
        }, (err) => { 
          Swal.fire('Error', err.error.msg, 'error') 
          return;
        });
    
    // CERRAR CAJA 
    this.caja.cerrada = true;
    this.cajaService.updateCaja(this.caja, this.caja.caid)
        .subscribe( resp => {

          localStorage.removeItem('turno');
          // REDIRECCIONAR AL DASHBOARD
          this.router.navigateByUrl('/');
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error') });

  }


  //  FIN DE LA CLASE
}
