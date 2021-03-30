import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators, FormBuilder } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';

import Swal from 'sweetalert2';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// SERVICES
import { InvoiceService } from '../../../services/invoice.service';
import { TurnoService } from '../../../services/turno.service';
import { EmpresaService } from '../../../services/empresa.service';

// MODELS
import { Invoice } from '../../../models/invoice.model';
import { Datos } from '../../../models/empresa.model';

// INTERFACES
import { LoadInvoice } from '../../../interfaces/invoice.interface';
import { _payments } from '../../../interfaces/carrito.interface';
import { LoadTurno, _movements } from '../../../interfaces/load-turno.interface';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styles: [
  ]
})
export class FacturaComponent implements OnInit {

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  public factura: LoadInvoice;

  constructor(  private invoiceService: InvoiceService,
                private activatedRoute: ActivatedRoute,
                private fb: FormBuilder,
                private turnoService: TurnoService,
                private empresaService: EmpresaService,
                private printerService: NgxPrinterService,) {

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {
                      console.log('Print window is open:', val);
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe( ({id}) => {
      
      this.cargarFactura(id);
      
    });

    this.cargarDatos();

  }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  printDiv() {
    this.printerService.printDiv('printDiv');
  }

  /** ================================================================
   *   CARGAR DATOS DE LA EMPRESA
  ==================================================================== */
  public empresa: Datos;
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {
          this.empresa = datos;   
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
  }

  /** ================================================================
   *   CARGAR FACTURA
  ==================================================================== */
  cargarFactura(id: string){
    
    this.invoiceService.loadInvoiceId(id)
        .subscribe( invoice => {

          this.factura = invoice;  
          
          console.log(this.factura.products);
          

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *   DEVOLVER FACTURA
  ==================================================================== */
  devolucion( id:string ){

    Swal.fire({
      title: 'Atencion',
      text: "Estas seguro de devolver esta factura",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, devolver',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {

        this.invoiceService.returnInvoice(id)
            .subscribe( resp => {
              
              Swal.fire(
                'Devolución exitosa!',
                'Esta factura, se ha devuelto exitosamente con todos los productos de la misma!',
                'success'
              );

            }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

      }
    })

  }

  /** ============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * INVOICE - INVOICE - INVOICE - INVOICE  
  ==================================================================== */
  public turno: LoadTurno;
  public movimientos: _movements[] = [];
  cargarTurno(){

    this.turnoService.getTurnoId(localStorage.getItem('turno'))
        .subscribe( (turno) => {

          this.turno = turno;
          this.movimientos = turno.movements;
                    
        });

  }
  
  public payments: _payments[] = [];
  public credit: boolean = false;

  public invoiceForm = this.fb.group({
    type: ['efectivo', [Validators.required]],
    payments: [''],
    credito: [this.credit]
  })

  /** ================================================================
   *   FACTURAR
  ==================================================================== */

  @ViewChild('descripcionAdd') descripcionAdd: ElementRef;
  @ViewChild('montoAdd') montoAdd: ElementRef;
  public vueltos: number = 0;

  focusMonto(){
        
    this.montoAdd.nativeElement.focus();

  }

  agregarPagos(type: string, amount:number, description:string = ''){

    if (type === 'credito') {
      this.credit = true;
      this.descripcionAdd.nativeElement.value = '';
      this.montoAdd.nativeElement.value = '';
      return;
    }

    if (amount === 0 || amount < 1) {
      Swal.fire('Atención', 'No has agregado un monto', 'info');
      return;      
    }

    let totales = Number( this.factura.amount - this.totalPagos );

    // COMPROBAR SI EL MONTO ES MAYOR AL RESTANTE
    if ( Number(this.montoAdd.nativeElement.value) > totales) {
      amount= ( this.factura.amount - this.totalPagos );
      this.vueltos = (this.montoAdd.nativeElement.value - totales);
    }else{
      amount = this.montoAdd.nativeElement.value;
      this.vueltos = (this.montoAdd.nativeElement.value - totales);
    }

    this.payments.push({
      type,
      amount,
      description
    });

    this.descripcionAdd.nativeElement.value = '';
    this.montoAdd.nativeElement.value = '';

    this.sumarPagos();
  }
  /** ================================================================
   *   ELIMINAR METODO DE PAGO
  ==================================================================== */
  eliminarPagos( item: any ){
    
    const i = this.payments.indexOf(item);

    if ( i !== -1 ) { this.payments.splice(i, 1); }

    this.sumarPagos();

    this.vueltos = (this.factura.amount - this.totalPagos);

  }

  /** ================================================================
   *   LIMPIAR METODO DE PAGO
  ==================================================================== */
  limpiarPagos(tipo: string = ''){

    if (tipo !== 'credito') {      
      this.credit = false;     
    }else{
      this.credit = true;
    }

    this.payments = [];
    this.vueltos = 0;
  }

  /** ================================================================
   *   SUMAR METODO DE PAGO
  ==================================================================== */
  public totalPagos:number = 0;
  sumarPagos(){
    
    this.totalPagos = 0;
    if (this.payments.length > 0) {
      
      for (let i = 0; i < this.payments.length; i++) {
        
        this.totalPagos += Number( this.payments[i].amount );        
      }

    }   

  }

  /** ================================================================
   *   GUARDAR PAGO
  ==================================================================== */
  guardarPago(){

    if (this.totalPagos !== this.factura.amount) {      
      Swal.fire('Atención!', 'Los montos no son iguales', 'info');
      return;
    }

    this.invoiceForm.setValue({
      payments: this.payments,
      credito: this.credit,
      type: this.invoiceForm.value.type,
    });

    this.invoiceService.updateInvoice( this.invoiceForm.value, this.factura.iid )
        .subscribe( ( resp:{ok: boolean, invoice: Invoice } ) => {

          

          this.invoiceForm.reset();

          window.location.reload();
          

        }, (err) => {

          console.log(err);
          

          Swal.fire('Error', err.error.msg, 'error');
        });

  }


  // FIN DE LA CLASE
}
