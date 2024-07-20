import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

// SERVICES
import { TurnoService } from '../../../services/turno.service';
import { SearchService } from '../../../services/search.service';
import { InvoiceService } from '../../../services/invoice.service';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// INTERFACES
import { LoadTurno, _movements } from '../../../interfaces/load-turno.interface';
import { DepartmentService } from 'src/app/services/department.service';
import { Observable, Subscription } from 'rxjs';
import { BancosService } from 'src/app/services/bancos.service';
import { Banco } from 'src/app/models/bancos.model';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { Impuesto } from 'src/app/models/impuesto.model';
import { AlquileresService } from 'src/app/services/alquileres.service';
import { Alquiler } from 'src/app/models/alquileres.model';
import { EmpresaService } from 'src/app/services/empresa.service';
import { Datos } from 'src/app/models/empresa.model';
import { ParqueoService } from 'src/app/services/parqueo.service';
import Swal from 'sweetalert2';
interface _departament {
  _id?: string,
  did?: string,
  name?: string,
  qty?: number,
  monto?: number
}

@Component({
  selector: 'app-cierres',
  templateUrl: './cierres.component.html',
  styles: [
  ]
})
export class CierresComponent implements OnInit {

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

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
                private searchService: SearchService,
                private bancosService: BancosService,
                private invoiceService: InvoiceService,
                private printerService: NgxPrinterService,
                private departmentService: DepartmentService,
                private impuestosService: ImpuestosService,
                private alquileresService: AlquileresService,
                private empresaService: EmpresaService,
                private parqueoService: ParqueoService) { 

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {                

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

    this.empresaService.getDatos().subscribe( datos => this.empresa = datos );
    
    // CARGAR IMPUESTOS
    this.cargarImpuestos();

    // CARGAR DEPARTAMENTOS
    this.cargarDepartamento();

    // BANCOS
    this.cargarBancos();

    // CARGAR TURNOS
    this.cargarTurno();
  }

  /** ================================================================
   *   CARGAR BANCOS
  ==================================================================== */
  public bancos: Banco[] = [];
  public bancosAbonos: Banco[] = [];
  public bancosAlquileres: Banco[] = [];
  cargarBancos(){

    this.bancos = [];
    this.bancosAbonos = [];

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
  cargarDepartamento(){

    this.departmentService.loadDepartment()
        .subscribe( ({departments}) => {

          this.departamento = departments;
          this.departamento.map((departamento) => {
            departamento.monto = 0;
            departamento.qty = 0;
          } );
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
  buscar(inicial:Date, final: Date, cajeros:string){
    
    this.sinResultados = true;
    
    if (inicial === null && final === null) {
      this.listaTurnos = this.listaTurnosTemp;
      this.resultado = 0;
      return;
    }else{

      if (!inicial) {
        this.listaTurnos = this.listaTurnosTemp;
        this.resultado = 0;
        return;
      }

      // SET HOURS      
      inicial = new Date(inicial);      
      const initial = new Date(inicial.getTime() + 1000 * 60 * 60 * 5);

      final = new Date(final);
      const end = new Date(final.getTime() + 1000 * 60 * 60 * 5);      
      // SET HOURS          

      this.sinResultados = true;
      this.turnoService.loadTurnoDate(initial, end, cajeros)
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
  public abEfectivo: number = 0;
  public abTarjeta: number = 0;
  public abTransferencia: number = 0;
  public totalBancos: number = 0;
  public totalBancosAbono: number = 0;
  
  async cargarTurnoId(id:string){

    this.movimientos = [];
    this.inicial = 0;

    this.totalBancosAbono = 0;

    this.bancos.map( (banco) => {
      banco.monto = 0;
    });

    this.bancosAbonos.map( (banco) => {
      banco.monto = 0;
    });

    // await this.cargarBancos();

    this.turnoService.getTurnoId(id)
    .subscribe( (turno) => { 
      this.turnoId = turno;
      this.movimientos = turno.movements;     

      this.inicial = turno.initial;

      this.abEfectivo = 0;
      this.abTarjeta = 0;
      this.abTransferencia = 0;

        
        for (const factura of turno.abonos) {        
  
          for (const pago of factura.factura.paymentsCredit ) {
  
            if (pago.turno === turno.tid  && factura.pay === pago._id && factura.factura.status) {
              
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
      
      
      this.procesarInformacion(id);

      // SI TIENES PAGOS DE ALQUILERES
      if (turno.alquileres.length > 0) {
        this.cargarAlquileres();      
      }else{
        this.alquileresList = [];
        this.alqEfectivo = 0;
        this.totalAlquiler = 0;

        this.bancosAlquileres.map( (banco) => {
          banco.monto = 0;
        });
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
  public credito: number = 0;
  public totalCreditos: number = 0;
  public vales: number = 0;
  public transferencia: number = 0;
  public devolucion: number = 0;
  public inicial: number = 0;
  public entradas: number = 0;
  public salidas: number = 0;
  public montoDiferencia: number = 0;
  public movimientos: _movements[] = [];
  public totalDevolucion: number = 0; 
  public parqueos: number = 0;

  public facturas: any[] = [];
  public departamento: _departament[] = [];
  
  procesarInformacion(id){

    this.montos = 0;
    this.costo = 0;
    this.propinas = 0;
    this.efectivo = 0;
    this.tarjeta = 0;
    this.transferencia = 0;
    this.credito = 0;
    this.totalCreditos = 0;
    this.vales = 0;
    this.entradas = 0;
    this.salidas = 0;
    this.montoDiferencia = 0;
    this.devolucion = 0;
    this.totalBancos = 0;

    this.departamento.forEach(depart => {
      depart.qty = 0;
      depart.monto = 0;      
    });
    
    const endPoint = `?turno=${id}`;

    this.parqueos = 0;

    this.parqueoService.loadParqueos({turno: id, estado: 'Finalizado'})
        .subscribe( ({parqueos}) => {

          for (const parq of parqueos) {
            this.parqueos += parq.total;
          }

          this.parqueos = 0;

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

    this.invoiceService.loadInvoiceCierre(endPoint)
        .subscribe(({invoices, total, montos, devolucion, costos, efectivo, tarjeta, transferencia, credit, creditos, vales, propinas}) => {

          this.montos = montos;
          this.propinas = propinas;
          this.costo = costos;
          
          this.tarjeta = tarjeta;
          this.transferencia = transferencia;
          this.credito = credit;
          this.totalCreditos = creditos;
          this.vales = vales;
          this.devolucion = devolucion;

          this.facturas = invoices;

          
          for (const factura of this.facturas) {
            
            for (const product of factura.products) {

              this.departamento.map( (depart) => {
                

                // if (product.product.department === depart._id) {
                //   depart.qty += product.qty,
                //   depart.monto += product.qty * product.price;
                // }

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
          
            for (const pago of factura.payments) {

              this.bancos.map( (banco) => {
    
                if (banco.name === pago.type) {
                  banco.monto += pago.amount;
    
                  this.totalBancos += pago.amount;
    
                };
    
              });
              
            }
            
          }


          // CARGAR LOS ABONOS A CREDITO          
          if (this.turnoId.abonos.length > 0) {

            for (const factura of this.turnoId.abonos) {

              for (const pago of factura.factura.paymentsCredit) {

                if (pago.turno === this.turnoId.tid && factura.pay === pago._id && factura.factura.status) {  

                  
                  this.bancosAbonos.map( (banco) => {
                    
                    if (banco.name === pago.type) {
                      banco.monto += pago.amount;      
                      this.totalBancosAbono += pago.amount;
                      
                    };
                    
                  });
                }
              }
              
            }

          }else{

            this.bancosAbonos.map( (banco) => {    
              banco.monto = 0;  
            });

          }

          this.efectivo = this.montos - this.totalBancos;

        });

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

    for (const alq of this.turnoId.alquileres) {
      await this.alquileresService.loadAlquilerId(alq.alquiler)
                .subscribe( ({alquiler}) => {

                  // SUMAR LOS PAGOS DE CADA BANCO
                  for (const pago of alquiler.payments) {
                    
                    this.bancosAlquileres.map( (banco) => {                
                      
                      if (banco.name === pago.type && this.turnoId.tid === pago.turno) {                  

                        banco.monto += pago.amount;
                        this.totalAlquiler += pago.amount;

                      }

                    });

                    if (pago.type === 'efectivo' && this.turnoId.tid === pago.turno) {
                      this.alqEfectivo += pago.amount;
                      this.totalAlquiler += pago.amount;
                    }
                    
                  }                  

                }, (err) => {
                  console.log(err);                  
                })
    }

  }


  // FIN DE LA CLASE
}
