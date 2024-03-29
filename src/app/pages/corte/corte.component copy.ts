// import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { Router } from '@angular/router';
// import { Subscription, Observable } from 'rxjs';
// import Swal from 'sweetalert2';

// // PRINTER
// import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
// import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
// import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// // SERVICES
// import { TurnoService } from '../../services/turno.service';
// import { CajaService } from '../../services/caja.service';
// import { UserService } from '../../services/user.service';
// import { InvoiceService } from '../../services/invoice.service';

// // INTERFACES
// import { LoadTurno, _movements } from '../../interfaces/load-turno.interface';
// import { _caja } from '../../interfaces/load-caja.interface';
// interface _departament {
//   _id?: string,
//   name?: string,
//   qty?: number,
//   monto?: number
// }

// // MODELS
// import { Caja } from '../../models/caja.model';
// import { User } from '../../models/user.model';
// import { DepartmentService } from '../../services/department.service';
// import { Banco } from 'src/app/models/bancos.model';
// import { BancosService } from '../../services/bancos.service';
// import { EmpresaService } from 'src/app/services/empresa.service';
// import { Datos } from 'src/app/models/empresa.model';

// @Component({
//   selector: 'app-corte',
//   templateUrl: './corte.component.html',
//   styleUrls: ['./corte.component.css']
// })
// export class CorteComponent implements OnInit {

//   @ViewChild('PrintTemplate')
//   private PrintTemplateTpl: TemplateRef<any>;

//   title = 'ngx-printer-demo';

//   printWindowSubscription: Subscription;
//   $printItems: Observable<PrintItem[]>;

//   public user:User;

//   constructor(  private turnoService: TurnoService,
//                 private bancosService: BancosService,
//                 private printerService: NgxPrinterService,
//                 private userService: UserService,
//                 private empresaService: EmpresaService,
//                 private invoiceService: InvoiceService,
//                 private departmentService: DepartmentService) {

//                   this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
//                     val => {

//                       this.user = this.userService.user;                      

//                       if (val) {
//                         window.location.reload();                        
//                       }
//                       console.log('Print window is open:', val);
//                     }
//                   );
              
//                   this.$printItems = this.printerService.$printItems;

//                 }

//   public empresa!: Datos;

//   ngOnInit(): void {    

//     this.empresaService.getDatos().subscribe( datos => this.empresa = datos );

//     if (!this.user.cerrada) {
      
//       // DEPARTAMENTO
//       this.cargarDepartamento();

//       // BANCOS
//       this.cargarBancos();

//     }else{
//       Swal.fire('Atención!', 'No existe un turno asignado, no puedes hacer cortes ni cierres', 'info');
//       return;
//     }   
    

//   }

//   /** ================================================================
//    *   CARGAR BANCOS
//   ==================================================================== */
//   public bancos: Banco[] = [];
//   public bancosAbonos: Banco[] = [];
//   cargarBancos(){

//     this.bancosService.loadBancos()
//         .subscribe( ({ bancos }) => {

//           bancos.map( (banco) => {
//             banco.monto = 0;
//           })

//           this.bancos = bancos;
//           this.bancosAbonos = bancos;

//         });

//   }

//   /** ================================================================
//    *   IMPRIMIR
//   ==================================================================== */
//   printDiv() {
//     this.printerService.printDiv('printDiv');
//   }

//   /** ===============================================================
//   * CAJA - CAJA - CAJA - CAJA  
//   ==================================================================== */
//   public caja: Caja;
//   // cargarCaja(){

//   //   this.cajaService.loadOneCaja(this.user.turno)
//   //       .subscribe( (caja) => {

//   //         this.caja = caja;      

//   //       }, (err) => { Swal.fire('Error', err.error.msg, 'error') });

//   // }

//   /** ===============================================================
//   * DEPARTAMENTO - DEPARTAMENTO - DEPARTAMENTO - DEPARTAMENTO  
//   ==================================================================== */
//   cargarDepartamento(){

//     this.departmentService.loadDepartment()
//         .subscribe( ({departments}) => {

//           for (let i = 0; i < departments.length; i++) {
            
//             const validarItem = this.departamento.findIndex( (resp) =>{             
  
//               if (resp._id === departments[i].did ) {
//                 return true;
//               }else {
//                 return false;
//               }

//             });

//             if ( validarItem === -1 ) {
              
//               this.departamento.push({
//                 _id: departments[i].did,
//                 name: departments[i].name,
//                 qty: 0,
//                 monto: 0
//               });

//             }
            
//           };
         
          
//           // TURNO
//           this.cargarTurno();
      
//           // FACTURAS
//           this.cargarFacturasTurno();
//           // CAJA

//         });

//   }

//   /** ===============================================================
//   * TURNO - TURNO - TURNO - TURNO  
//   ==================================================================== */
//   public abEfectivo: number = 0;
//   public abTarjeta: number = 0;
//   public abTransferencia: number = 0;
//   public turno: LoadTurno;
//   public totalDevolucion: number = 0; 
//   cargarTurno(){  
//     this.turnoService.getTurnoId(this.user.turno)
//     .subscribe( (turno) => { 

//       if (turno.devolucion.length > 0) {
//         turno.devolucion.forEach(devolucion => {
//           this.totalDevolucion += devolucion.monto;
//         });
//       }

//       this.turno = turno;
//       this.movimientos = turno.movements;
//       this.inicial = turno.initial;

//       this.abEfectivo = 0;
//       this.abTarjeta = 0;
//       this.abTransferencia = 0;
      
//       for (const factura of turno.abonos) {

//         // ABONOS EN BANCOS bancosAbonos
//         for (const pago of factura.factura.paymentsCredit) {

//           this.bancosAbonos.map( (banco) => {

//             if (banco.name === pago.type) {
//               banco.monto += pago.amount;

//               this.totalBancosAbono += pago.amount;

//             };

//           });
          
//         }
           

//         for (const pago of factura.factura.paymentsCredit) {

//           if (pago.turno === turno.tid && factura.pay === pago._id && factura.factura.status) {
            
//             if (pago.type === "efectivo") {
//               this.abEfectivo += pago.amount;
//             }else if (pago.type === "tarjeta") {
//               this.abTarjeta += pago.amount;              
//             }else if (pago.type === "transferencia") {
//               this.abTransferencia += pago.amount;              
//             }
//           }

//         }
        
//       }     
            
//       this.procesarInformacion();
      
//     });
//   }
  
//   /** ===============================================================
//   * PROCESAR LA INFORMACION 
//   ==================================================================== */
  

//   public montos: number = 0;
//   public costo: number = 0;
//   public efectivo: number = 0;
//   public tarjeta: number = 0;
//   public transferencia: number = 0;
//   public credito: number = 0;
//   public vales: number = 0;
//   public devolucion: number = 0;
//   public facturas: any[] = [];
//   public departamento: _departament[] = [];
//   public totalBancos: number = 0;
//   public totalBancosAbono: number = 0;

//   cargarFacturasTurno(){

//     const endPoint = `?turno=${this.user.turno}`;

//     this.invoiceService.loadInvoiceCierre(endPoint)
//         .subscribe( ({invoices, total, devolucion, montos, costos, efectivo, tarjeta, transferencia, credit, vales}) => {

//           this.montos = montos;
//           this.costo = costos;
//           this.efectivo = efectivo;
//           this.tarjeta = tarjeta;
//           this.transferencia = transferencia;
//           this.credito = credit;
//           this.vales = vales;
//           this.devolucion = devolucion;          

//           this.facturas = invoices;
          
//           for (const factura of this.facturas) {
            
//             for (const product of factura.products) {

//               this.departamento.map( (depart) => {

//                 if (product.product?.department === depart._id) {
//                   depart.qty += product.qty,
//                   depart.monto += product.qty * product.price;
//                 }

//               });
              
//             }

//             // SUMAR LOS PAGOS DE BANCOS
//             for (const pago of factura.payments) {

//               this.bancos.map( (banco) => {
                
                
//                 if (banco.name === pago.type) {                  

//                   banco.monto += pago.amount;

//                   this.totalBancos += pago.amount;

//                 };

//               });
              
//             }
            
//           }

//           this.bancos.map( (banco) => {

//               this.totalBancos += banco.monto;

//           });
         
          
//         });
//   }

//   /** ===============================================================
//   * PROCESAR LA INFORMACION 
//   ==================================================================== */
//   public inicial: number = 0;
//   public entradas: number = 0;
//   public salidas: number = 0;
//   public movimientos: _movements[] = [];
  
//   procesarInformacion(){

//     // TOTALIZAR MOVIMIENTOS
//     const movements = this.movimientos;
//     for (let i = 0; i < movements.length; i++) {
      
//       switch (movements[i].type) {
//         case 'entrada':

//           this.entradas += movements[i].monto;
          
//           break;

//         case 'salida':

//           this.salidas += movements[i].monto;
          
//           break;
      
//         default:
//           break;
//       }
      
//     }

//     // TOTALIZAR MOVIMIENTOS
//   }

//   /** ===============================================================
//   * CERRAR CAJA Y TURNO 
//   ==================================================================== */
//   public fechaCierre: Date;
//   public montoDiferencia: number;
//   public diferencia: boolean;

//   cerrarTurno(dineroCaja: number){

//     const totalEfectivo = (this.efectivo + this.entradas + this.inicial + this.abEfectivo + this.salidas);

//     if ((Number(dineroCaja) - this.totalDevolucion) !== totalEfectivo) {
//       this.turno.diferencia = true;
//       this.turno.montoD = Number(dineroCaja) - totalEfectivo;
//     }

//     this.turno.cerrado = true;
//     this.turno.cierre = new Date();

//     // CERRAR TURNO
//     this.turnoService.updateTurno(this.turno, this.turno.tid)
//         .subscribe( (resp:{ ok:boolean, turno: LoadTurno }) => {        
          
//           this.fechaCierre = resp.turno.cierre;
//           this.diferencia = resp.turno.diferencia ;
//           this.montoDiferencia = resp.turno.montoD ;

//           this.userService.user.cerrada = true;

//           // IMPRIMIR FACTURA
//           setTimeout( () => {

//             this.printDiv();

//           },1000);

//         }, (err) => { 
//           Swal.fire('Error', err.error.msg, 'error') 
//           return;
//         });
    
//     // CERRAR CAJA 
//     // this.caja.cerrada = true;
//     // this.cajaService.updateCaja(this.caja, this.caja.caid)
//     //     .subscribe( resp => {

//     //       localStorage.removeItem('turno');          
          
//     //     }, (err) => { Swal.fire('Error', err.error.msg, 'error') });

//   }


//   //  FIN DE LA CLASE
// }
