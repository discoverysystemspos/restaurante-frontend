import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import Swal from 'sweetalert2';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// SERVICES
import { TurnoService } from '../../services/turno.service';
import { CajaService } from '../../services/caja.service';
import { UserService } from '../../services/user.service';

// INTERFACES
import { LoadTurno, _movements } from '../../interfaces/load-turno.interface';
import { _caja } from '../../interfaces/load-caja.interface';

// MODELS
import { Caja } from '../../models/caja.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-corte',
  templateUrl: './corte.component.html',
  styles: [
  ]
})
export class CorteComponent implements OnInit {

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  public user:User;

  constructor(  private turnoService: TurnoService,
                private cajaService: CajaService,
                private router: Router,
                private printerService: NgxPrinterService,
                private userService: UserService) {

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {

                      this.user = this.userService.user;

                      console.log(this.user);
                      

                      if (val) {
                        window.location.reload();                        
                      }
                      console.log('Print window is open:', val);
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                }

  ngOnInit(): void {    

    if (!this.user.cerrada) {
      
      // TURNO
      this.cargarTurno();
  
      // CAJA
      // this.cargarCaja();

    }else{
      Swal.fire('Atención!', 'No existe un turno asignado, no puedes hacer cortes ni cierres', 'info');
      return;
    }   
    

  }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  printDiv() {
    this.printerService.printDiv('printDiv');
  }

  /** ===============================================================
  * CAJA - CAJA - CAJA - CAJA  
  ==================================================================== */
  public caja: Caja;
  // cargarCaja(){

  //   this.cajaService.loadOneCaja(this.user.turno)
  //       .subscribe( (caja) => {

  //         this.caja = caja;      

  //       }, (err) => { Swal.fire('Error', err.error.msg, 'error') });

  // }

  /** ===============================================================
  * TURNO - TURNO - TURNO - TURNO  
  ==================================================================== */
  public turno: LoadTurno;
  cargarTurno(){  
    this.turnoService.getTurnoId(this.user.turno)
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
  public costo: number = 0;
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
        
      this.costo += sales[i].facturas.cost;
        
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
  public fechaCierre: Date;
  public montoDiferencia: number;
  public diferencia: boolean;

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
        .subscribe( (resp:{ ok:boolean, turno: LoadTurno }) => {        
          
          this.fechaCierre = resp.turno.cierre;
          this.diferencia = resp.turno.diferencia;
          this.montoDiferencia = resp.turno.montoD;

          this.userService.user.cerrada = true;

          // IMPRIMIR FACTURA
          setTimeout( () => {

            this.printDiv();

          },1000);

        }, (err) => { 
          Swal.fire('Error', err.error.msg, 'error') 
          return;
        });
    
    // CERRAR CAJA 
    // this.caja.cerrada = true;
    // this.cajaService.updateCaja(this.caja, this.caja.caid)
    //     .subscribe( resp => {

    //       localStorage.removeItem('turno');          
          
    //     }, (err) => { Swal.fire('Error', err.error.msg, 'error') });

  }


  //  FIN DE LA CLASE
}
