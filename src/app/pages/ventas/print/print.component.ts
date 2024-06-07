import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import Swal from 'sweetalert2';

import { QRCodeModule } from 'angularx-qrcode';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// SERVICES
import { InvoiceService } from '../../../services/invoice.service';
import { EmpresaService } from '../../../services/empresa.service';

// INTERFACES
import { LoadInvoice } from '../../../interfaces/invoice.interface';

// MODELS
import { Datos } from '../../../models/empresa.model';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { Impuestos } from '../../../models/impuestos.model';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css']
})
export class PrintComponent implements OnInit {

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  public factura: LoadInvoice;

  constructor(  private activatedRoute: ActivatedRoute,
                private invoiceService: InvoiceService,
                private printerService: NgxPrinterService,
                private empresaService: EmpresaService,
                private impuestosService: ImpuestosService
                ) {

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {
                      console.log('Print window is open:', val);
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                 }

  ngOnInit(): void {

    // CARGAR DATOS
    this.cargarDatos();

      

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


          // CARGAR FACTURA
          this.activatedRoute.params.subscribe( ({id}) => {
            
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
   *   CARGAR FACTURA
  ==================================================================== */
  public totalPagos: number = 0;
  cargarFactura(id: string){
    
    this.invoiceService.loadInvoiceId(id)
        .subscribe( invoice => {

          this.factura = invoice;
          this.factura.totalItems = 0;          

          for (const pay of invoice.payments) {
            this.totalPagos = this.totalPagos + pay.amount;
          }

          
          for (const product of invoice.products) {
            
            if( this.empresa.impuesto ){

              this.impuestos.map( (impuesto) => {  
                if (impuesto.taxid === product.product.taxid._id) {                  
                  impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);
                }  
              });
            }

            this.factura.totalItems += product.qty;

          }
          
          // IMPRIMIR FACTURA
          setTimeout( () => {

            this.printDiv();

          },3000);          

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *   CARGAR DATOS DE LA EMPRESA
  ==================================================================== */
  public empresa: Datos;
  public ticketHeader: any;
  public ticketfooter: any;
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {
          this.empresa = datos;  
          

          this.ticketHeader =  this.empresa.header.split('\n');
          this.ticketfooter =  this.empresa.footer.split('\n');

          this.cargarImpuestos();
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
  }
  
  // FIN DE LA CLASE
}
