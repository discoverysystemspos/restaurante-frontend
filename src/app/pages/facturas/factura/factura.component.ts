import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators, FormBuilder } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';

import Swal from 'sweetalert2';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
import { LoadInvoice, _products } from '../../../interfaces/invoice.interface';
import { _payments, Carrito, _paymentsCredito } from '../../../interfaces/carrito.interface';
import { LoadTurno, _movements } from '../../../interfaces/load-turno.interface';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { Impuestos } from '../../../models/impuestos.model';
import { User } from 'src/app/models/user.model';
import { UserService } from '../../../services/user.service';

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
  public user: User;

  constructor(  private invoiceService: InvoiceService,
                private activatedRoute: ActivatedRoute,
                private fb: FormBuilder,
                private turnoService: TurnoService,
                private empresaService: EmpresaService,
                private printerService: NgxPrinterService,
                private impuestosService: ImpuestosService,
                private userService: UserService,) {

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {
                      console.log('Print window is open:', val);
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                    this.user = userService.user;

                }

  ngOnInit(): void {

    this.cargarDatos();

    // CARGAR TURNO
    this.cargarTurno();
    
  }
  /** ================================================================
   *   CARGAR IMPUESTOS
  ==================================================================== */
  public impuestos: Impuestos[] = [];
  cargarImpuestos(){

    this.impuestosService.loadImpuestos()
        .subscribe( ({taxes}) => {

          this.impuestos = taxes;

          this.impuestos.map( impuesto => {
            impuesto.total = 0;
          })


          this.activatedRoute.params.subscribe( ({id}) => {

            this.idFactura = id;
            
            this.cargarFactura(id);
            
          });

        });

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

          this.cargarImpuestos();

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
  }

  /** ================================================================
   *   CARGAR FACTURA a
  ==================================================================== */
  public idFactura;
  public iva: number = 0;
  cargarFactura(id: string){
    
    this.invoiceService.loadInvoiceId(id)
        .subscribe( invoice => {

          this.factura = invoice;
          this.paymentsCredit = this.factura.paymentsCredit;
          this.payments = this.factura.payments;
          this.iva = invoice.iva;
          this.sumarPagos();

          console.log(invoice);
          

          this.vueltos = Number( this.factura.amount - this.totalPagos);    
          
          if( this.empresa.impuesto ){

            for (const product of invoice.products) {

              this.impuestos.map( (impuesto) => {
  
                if (impuesto.taxid === product.product.taxid) {
                  
                  impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);

                }
  
              });

            }

          }          
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *   ELIMINAR PRODUCTO
  ==================================================================== */
  eliminarProducto(id: string){

    this.invoiceService.deleteProductInvoice(this.idFactura, id)
        .subscribe( (resp: {ok: boolean, invoice: LoadInvoice} ) => {

          this.factura = resp.invoice;

          this.cargarFactura(this.idFactura);

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); })    

  }

  /** ================================================================
   *   DEVOLVER PRODUCTOS
  ==================================================================== */
  devolverProducto(producto: Carrito){

    Swal.fire({
      title: 'Cantidad',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      showLoaderOnConfirm: true,
      preConfirm: (resp) => {
        
        return resp;
      }
    }).then((result) => {

      if (result.value > 0) {
        
        const cantidad:number = Number(result.value);

        if (cantidad < producto.qty && cantidad !== 0) {

          this.invoiceService.updateProdutInvoice(this.idFactura, producto._id, cantidad)
              .subscribe( resp => {

                                
                this.cargarFactura(this.idFactura);
                
              });
          
        }else if (cantidad >= producto.qty) {
          
          Swal.fire('Información', 'No se devolvio ningun producto, si vas a devolver todos los productos dar click en eliminar', 'info');
          
        }
        
        return;
      }else{
        return;
      }                
      
    });
    

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

    this.turnoService.getTurnoId(this.user.turno)
        .subscribe( (turno) => {

          this.turno = turno;
          this.movimientos = turno.movements;
                    
        });

  }
  
  public payments: _payments[] = [];
  public paymentsCredit: _paymentsCredito[] = [];
  public credit: boolean = false;

  public invoiceForm = this.fb.group({
    type: ['efectivo', [Validators.required]],
    paymentsCredit: [''],
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

  agregarPagos(type: string, amount:number, description:string = '', credito: boolean){

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

    this.paymentsCredit.push({
      type,
      amount,
      description,
      turno: this.user.turno
    });

    this.descripcionAdd.nativeElement.value = '';
    this.montoAdd.nativeElement.value = '';    

    this.sumarPagos();

    

    if (credito) {

      this.invoiceForm.setValue({
        paymentsCredit: this.paymentsCredit,
        credito: true,
        type: this.invoiceForm.value.type,
      });

      this.invoiceService.updateInvoice( this.invoiceForm.value, this.factura.iid )
        .subscribe( ( resp:{ok: boolean, invoice: Invoice } ) => {

          let payTurno = {
            factura: this.factura.iid,
            pay: resp.invoice.paymentsCredit[resp.invoice.paymentsCredit.length - 1]._id,
            monto: amount,
          }

          this.turno.abonos.push(payTurno);
          
          this.turnoService.updateTurno({abonos:this.turno.abonos}, this.user.turno)
          .subscribe( resp => {
            
              window.location.reload();                

            }, (err) => {
              console.log(err);              
            })

        }, (err) => {

          Swal.fire('Error', err.error.msg, 'error');
        });
    }
  }
  /** ================================================================
   *   ELIMINAR METODO DE PAGO 
  ==================================================================== */
  eliminarPagos( item: any ){
    
    const i = this.paymentsCredit.indexOf(item);

    if ( i !== -1 ) { this.paymentsCredit.splice(i, 1); }

    this.sumarPagos();

    this.vueltos = (this.factura.amount - this.totalPagos);

    this.invoiceForm.setValue({
      paymentsCredit: this.paymentsCredit,
      credito: true,
      type: this.invoiceForm.value.type,
    });

    this.invoiceService.updateInvoice( this.invoiceForm.value, this.factura.iid )
        .subscribe( ( resp:{ok: boolean, invoice: Invoice } ) => {

          

          this.invoiceForm.reset();

          window.location.reload();
          

        }, (err) => {

          Swal.fire('Error', err.error.msg, 'error');
        });

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

    this.paymentsCredit = this.factura.paymentsCredit;
    this.sumarPagos();
    this.vueltos = Number( this.factura.amount - this.totalPagos);
    
  }

  /** ================================================================
   *   SUMAR METODO DE PAGO
  ==================================================================== */
  public totalPagos:number = 0;
  sumarPagos(){
    
    this.totalPagos = 0;
    if (this.paymentsCredit.length > 0) {
      
      for (let i = 0; i < this.paymentsCredit.length; i++) {
        
        this.totalPagos += Number( this.paymentsCredit[i].amount );        
      }

    }

    if (this.payments.length > 0) {
      
      for (let i = 0; i < this.payments.length; i++) {
        
        this.totalPagos += Number( this.payments[i].amount );        
      }

    }

    if (this.vueltos < 0) {
      this.vueltos = this.vueltos * -1;
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
      paymentsCredit: this.paymentsCredit,
      credito: this.credit,
      type: this.invoiceForm.value.type,
    });        

    this.invoiceService.updateInvoice( this.invoiceForm.value, this.factura.iid )
        .subscribe( ( resp:{ok: boolean, invoice: Invoice } ) => {

          let payTurno = {
            factura: this.factura.iid,
            pay: resp.invoice.paymentsCredit[resp.invoice.paymentsCredit.length - 1]._id,
            monto: resp.invoice.paymentsCredit[resp.invoice.paymentsCredit.length - 1].amount,
          }

          this.turno.abonos.push(payTurno);
          
          this.turnoService.updateTurno({abonos:this.turno.abonos}, this.user.turno)
          .subscribe( resp => {

              this.invoiceForm.reset();
            
              window.location.reload();                

            }, (err) => {
              console.log(err);              
            })          

        }, (err) => {
          console.log(err);
          
          Swal.fire('Error', err.error.msg, 'error');
        });

  }

  /** ================================================================
   *   ACTUALIZAR FECHA DE VENCIMIENTO
  ==================================================================== */
  actualizarVencimiento(fechaCredito: Date){

    this.invoiceService.updateInvoice({fechaCredito}, this.factura.iid)
        .subscribe( (resp: {invoice}) => {

          this.factura.fechaCredito = resp.invoice.fechaCredito;

        });

  }

  /** ================================================================
   *   PDF
  ==================================================================== */
  downloadPDF() {
    // Extraemos el
    const DATA = document.getElementById('printDiv') as HTMLElement;
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 3
    };
    html2canvas( DATA , options).then((canvas) => {

      const img = canvas.toDataURL('image/PNG');

      // Add image Canvas to PDF
      const bufferX = 15;
      const bufferY = 15;
      const imgProps = (doc as any).getImageProperties(img);
      const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
      return doc;
    }).then((docResult) => {
      docResult.save(`${new Date().toISOString()}.pdf`);
    });
  }


  // FIN DE LA CLASE
}
