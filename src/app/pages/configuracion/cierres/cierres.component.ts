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
interface _departament {
  _id?: string,
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
                private invoiceService: InvoiceService,
                private printerService: NgxPrinterService,
                private departmentService: DepartmentService) { 

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

  ngOnInit(): void {
    
    // CARGAR DEPARTAMENTOS
    this.cargarDepartamento();

    // CARGAR TURNOS
    this.cargarTurno();
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

          for (let i = 0; i < departments.length; i++) {
            
            const validarItem = this.departamento.findIndex( (resp) =>{             
  
              if (resp._id === departments[i].did ) {
                return true;
              }else {
                return false;
              }

            });

            if ( validarItem === -1 ) {
              
              this.departamento.push({
                _id: departments[i].did,
                name: departments[i].name,
                qty: 0
              });

            }
            
          };

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
  cargarTurnoId(id:string){

    this.movimientos = [];
    this.inicial = 0;

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
      
    });
  }
  
  /** ===============================================================
  * PROCESAR LA INFORMACION 
  ==================================================================== */
  public montos: number = 0;
  public costo: number = 0;
  public efectivo: number = 0;
  public tarjeta: number = 0;
  public credito: number = 0;
  public vales: number = 0;
  public transferencia: number = 0;
  public devolucion: number = 0;
  public inicial: number = 0;
  public entradas: number = 0;
  public salidas: number = 0;
  public montoDiferencia: number = 0;
  public movimientos: _movements[] = [];

  public facturas: any[] = [];
  public departamento: _departament[] = [];
  
  procesarInformacion(id){

    this.montos = 0;
    this.costo = 0;
    this.efectivo = 0;
    this.tarjeta = 0;
    this.transferencia = 0;
    this.credito = 0;
    this.vales = 0;
    this.entradas = 0;
    this.salidas = 0;
    this.montoDiferencia = 0;
    this.devolucion = 0;

    this.departamento.forEach(depart => {
      depart.qty = 0;
      depart.monto = 0;      
    });
    
    const endPoint = `?turno=${id}`;

    this.invoiceService.loadInvoiceCierre(endPoint)
        .subscribe(({invoices, total, montos, devolucion, costos, efectivo, tarjeta, transferencia, credit, vales}) => {

          this.montos = montos;
          this.costo = costos;
          this.efectivo = efectivo;
          this.tarjeta = tarjeta;
          this.transferencia = transferencia;
          this.credito = credit;
          this.vales = vales;
          this.devolucion = devolucion;

          this.facturas = invoices;

          for (const factura of this.facturas) {
            
            for (const product of factura.products) {

              this.departamento.map( (depart) => {

                if (product.product.department === depart._id) {
                  depart.qty += product.qty,
                  depart.monto += product.qty * product.price;
                }

              });
              
            }
            
          }


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


  // FIN DE LA CLASE
}
