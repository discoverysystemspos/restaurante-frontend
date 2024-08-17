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
import { InvoiceService } from '../../services/invoice.service';

// INTERFACES
import { LoadTurno, _movements } from '../../interfaces/load-turno.interface';
import { _caja } from '../../interfaces/load-caja.interface';
interface _departament {
  _id?: string,
  did?: string,
  name?: string,
  qty?: number,
  monto?: number
}

// MODELS
import { Caja } from '../../models/caja.model';
import { User } from '../../models/user.model';
import { DepartmentService } from '../../services/department.service';
import { Banco } from 'src/app/models/bancos.model';
import { BancosService } from '../../services/bancos.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { Datos } from 'src/app/models/empresa.model';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { Impuesto } from 'src/app/models/impuesto.model';
import { AlquileresService } from 'src/app/services/alquileres.service';
import { Alquiler } from 'src/app/models/alquileres.model';
import { ParqueoService } from 'src/app/services/parqueo.service';

@Component({
  selector: 'app-corte',
  templateUrl: './corte.component.html',
  styleUrls: ['./corte.component.css']
})
export class CorteComponent implements OnInit {

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  public user:User;

  constructor(  private turnoService: TurnoService,
                private bancosService: BancosService,
                private printerService: NgxPrinterService,
                private userService: UserService,
                private empresaService: EmpresaService,
                private invoiceService: InvoiceService,
                private departmentService: DepartmentService,
                private impuestosService: ImpuestosService,
                private alquileresService: AlquileresService,
                private parqueoService: ParqueoService) {

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {

                      this.user = this.userService.user;
                      
                      if (!this.user.privilegios[0].cierre) {

                        this.corte();
                        
                      }

                      if (val) {
                        window.location.reload();                        
                      }
                      console.log('Print window is open:', val);
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                }

  public empresa!: Datos;

  ngOnInit(): void {    

    this.empresaService.getDatos().subscribe( datos => {
      this.empresa = datos 

      if (this.empresa.parqueadero! && !this.user.cerrada) {
        this.loadParqueos();
      }
    
    });

    if (!this.user.cerrada) {
      
      // IMPUESTOS
      this.cargarImpuestos();

      // DEPARTAMENTO
      this.cargarDepartamento();

      // BANCOS
      this.cargarBancos();      

    }else{
      Swal.fire('Atención!', 'No existe un turno asignado, no puedes hacer cortes ni cierres', 'info');
      return;
    }   
    

  }

  /** ================================================================
   *   LOAD PARQUEADERO
  ==================================================================== */
  public parqueos: number = 0;
  loadParqueos(){

    this.parqueos = 0;

  }

  /** ================================================================
   *   CARGAR BANCOS
  ==================================================================== */
  public bancos: Banco[] = [];
  public bancosAbonos: Banco[] = [];
  public bancosAlquileres: Banco[] = [];
  cargarBancos(){

    this.bancosService.loadBancos()
        .subscribe( ({ bancos }) => {          

          bancos.map( (banco) => {
            banco.monto = 0;
          });   

          this.bancos = bancos;

    });

    this.bancosService.loadBancos()
        .subscribe( ({ bancos }) => {          

          bancos.map( (banco) => {
            banco.monto = 0;
          });   
          
          this.bancosAbonos = bancos;

    });

    this.bancosService.loadBancos()
        .subscribe( ({ bancos }) => {          

          bancos.map( (banco) => {
            banco.monto = 0;
          });   
          
          this.bancosAlquileres = bancos;

    });

  }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  printDiv() {
    this.printerService.printDiv('printDiv');
  }  

  /** ===============================================================
  * DEPARTAMENTO - DEPARTAMENTO - DEPARTAMENTO - DEPARTAMENTO  
  ==================================================================== */
  public departamento: _departament[] = [];
  cargarDepartamento(){

    this.departmentService.loadDepartment()
        .subscribe( ({departments}) => {

          this.departamento = departments;
          this.departamento.map((departamento) => {
            departamento.monto = 0;
            departamento.qty = 0;
          } );          
          
          // TURNO
          this.cargarTurno();
      
          // FACTURAS
          this.cargarFacturasTurno();
          // CAJA

    });

  }

  /** ===============================================================
  * DEPARTAMENTO - DEPARTAMENTO - DEPARTAMENTO - DEPARTAMENTO  
  ==================================================================== */
  public impuestos: Impuesto[] = [];
  cargarImpuestos(){
    this.impuestosService.loadImpuestos()
        .subscribe( ({taxes}) => {
          this.impuestos = taxes; 
        });
  }

  /** ===============================================================
  * TURNO - TURNO - TURNO - TURNO  
  ==================================================================== */
  public abEfectivo: number = 0;
  public abTarjeta: number = 0;
  public abTransferencia: number = 0;
  public turno: LoadTurno;
  public totalDevolucion: number = 0; 

  public inicial: number = 0;
  public entradas: number = 0;
  public salidas: number = 0;
  public movimientos: _movements[] = [];

  cargarTurno(){  
    this.turnoService.getTurnoId(this.user.turno)
    .subscribe( (turno) => { 

      if (turno.devolucion.length > 0) {
        turno.devolucion.forEach(devolucion => {
          this.totalDevolucion += devolucion.monto;
        });
      }

      this.turno = turno;
      this.movimientos = turno.movements;
      this.inicial = turno.initial;

      this.abEfectivo = 0;
      this.abTarjeta = 0;
      this.abTransferencia = 0;
      this.totalBancosAbono = 0;
      
      for (const factura of turno.abonos) {

        // ABONOS EN BANCOS bancosAbonos
        for (const pago of factura.factura.paymentsCredit) {

          if (pago.turno === turno.tid && factura.pay === pago._id && factura.factura.status) {             
            
            this.bancosAbonos.map( (banco) => {
              
              if (banco.name === pago.type) {
                banco.monto += pago.amount;
                
                this.totalBancosAbono += pago.amount;
                
              };
              
            });

          }
          
        }
           

        for (const pago of factura.factura.paymentsCredit) {

          if (pago.turno === turno.tid && factura.pay === pago._id && factura.factura.status) {
            
            if (pago.type === "efectivo") {
              this.abEfectivo += pago.amount;
            }else if (pago.type === "tarjeta") {
              this.abTarjeta += pago.amount;              
            }else if (pago.type === "transferencia") {
              this.abTransferencia += pago.amount;              
            }
          }

        }
        
      }
      
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

    // SI TIENES PAGOS DE ALQUILERES
    if (this.turno.alquileres.length > 0) {
      this.cargarAlquileres();      
    }
      
      
    });
  }
  
  /** ===============================================================
  * PROCESAR LA INFORMACION 
  ==================================================================== */
  public propinas: number = 0;
  public montos: number = 0;
  public costo: number = 0;
  public efectivo: number = 0;
  public tarjeta: number = 0;
  public transferencia: number = 0;
  public credito: number = 0;
  public vales: number = 0;
  public devolucion: number = 0;
  public facturas: any[] = [];
  
  public totalCreditos: number = 0;
  public totalBancos: number = 0;
  public totalBancosAbono: number = 0;

  cargarFacturasTurno(){

    const endPoint = `?turno=${this.user.turno}`;

    this.invoiceService.loadInvoiceCierre(endPoint)
        .subscribe( ({invoices, total, devolucion, montos, costos, efectivo, tarjeta, transferencia, credit, creditos, vales, propinas}) => {

          this.montos = montos;
          this.propinas = propinas;
          this.costo = costos;
          this.efectivo = efectivo;
          this.credito = credit;
          this.devolucion = devolucion;
          this.transferencia = transferencia;
          this.totalBancos = 0;
          this.totalCreditos = creditos;
          
          this.facturas = invoices;

          for (const factura of this.facturas) {
            
            // SUMAR LAS VENTAS POR DEPARTAMENTOS
            for (const product of factura.products) {
              
              this.departamento.map( (depart) => {
                                
                if (product.product?.department === depart.did) {                  

                  // COMPROBAR SI EL PRODUCTO TIENE IMPUESTO
                  if (!product.product.tax) {
                    depart.qty = depart.qty + product.qty,
                    depart.monto = depart.monto + (product.qty * product.price);
                    
                  }else{
                    depart.qty = depart.qty + product.qty,
                    this.impuestos.map( (impuesto) => {
                      if (product.product.taxid === impuesto.taxid) {
                        depart.monto = depart.monto + (product.qty * (((product.price * impuesto.valor)/100) + product.price));                        
                      }
                    })

                  }
                
                }

              });
              
            }

            // SUMAR LOS PAGOS DE CADA BANCO
            for (const pago of factura.payments) {
              
              this.bancos.map( (banco) => {                
                
                if (banco.name === pago.type) {                  

                  banco.monto += pago.amount;

                  this.totalBancos += pago.amount;

                }

              });
              
            }

          } 

          // this.efectivo = this.montos - this.totalBancos;
          
        });
  }
  

  /** ===============================================================
  * CARGAR ALQUILERES
  ==================================================================== */
  public alquileresList: Alquiler[] = [];
  public alqEfectivo: number = 0;
  public totalAlquiler: number = 0;
  
  async cargarAlquileres(){

    this.alquileresList = [];
    this.alqEfectivo = 0;
    this.totalAlquiler = 0;

    for (const alq of this.turno.alquileres) {
      await this.alquileresService.loadAlquilerId(alq.alquiler)
                .subscribe( ({alquiler}) => {

                  // SUMAR LOS PAGOS DE CADA BANCO
                  for (const pago of alquiler.payments) {
                    
                    this.bancosAlquileres.map( (banco) => {                
                      
                      if (banco.name === pago.type && this.turno.tid === pago.turno) {                  

                        banco.monto += pago.amount;
                        this.totalAlquiler += pago.amount;

                      }

                    });

                    if (pago.type === 'efectivo' && this.turno.tid === pago.turno) {
                      this.alqEfectivo += pago.amount;
                      this.totalAlquiler += pago.amount;
                    }
                    
                  }
                  

                }, (err) => {
                  console.log(err);
                  
                })
    }

  }


  /** ===============================================================
  * CERRAR CAJA Y TURNO 
  ==================================================================== */
  public fechaCierre: Date;
  public montoDiferencia: number;
  public diferencia: boolean;

  cerrarTurno(dineroCaja: number){

    const totalEfectivo = (this.parqueos + this.efectivo + this.entradas + this.inicial + this.abEfectivo + this.salidas);

    if ((Number(dineroCaja) - this.totalDevolucion) !== totalEfectivo) {
      this.turno.diferencia = true;
      this.turno.montoD = Number(dineroCaja) - totalEfectivo;
    }

    this.turno.cerrado = true;
    this.turno.cierre = new Date();

    // CERRAR TURNO
    this.turnoService.updateTurno(this.turno, this.turno.tid)
        .subscribe( (resp:{ ok:boolean, turno: LoadTurno }) => {        
          
          this.fechaCierre = resp.turno.cierre;
          this.diferencia = resp.turno.diferencia ;
          this.montoDiferencia = resp.turno.montoD ;

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

  /** ================================================================
   *   ABRIR CAJA
  ==================================================================== */
  corte(){
    
    if (!this.user.cerrada) {

      Swal.fire({
        title: 'Cuanto efectivo existe en caja',
        input: 'number',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Cerrar Caja',
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: (resp) => {
          
          return resp;
        }
        }).then((result) => {
  
          if (result.value > 0) {
  
            const monto:number = result.value;

            this.cerrarTurno(monto)
  
           
            return;
          }else{
            return;
          }                
          
      });
    }
    


  }


  //  FIN DE LA CLASE
}
