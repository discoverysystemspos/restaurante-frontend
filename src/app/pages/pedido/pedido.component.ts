import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// SERVICES
import { PedidosService } from '../../services/pedidos.service';

// MODELS
import { Pedido } from 'src/app/models/pedido.models';
import Swal from 'sweetalert2';
import { Observable, Subscription } from 'rxjs';
import { EmpresaService } from '../../services/empresa.service';
import { Datos } from '../../models/empresa.model';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styles: [
  ]
})
export class PedidoComponent implements OnInit {

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  constructor(  private printerService: NgxPrinterService,
                private pedidosService: PedidosService,
                private activatedRoute: ActivatedRoute,
                private empresaService: EmpresaService) {

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {
                      console.log('Print window is open:', val);
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                 }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe( ({id}) => {

      this.pedidoID = id;
      
      this.cargarPedido(this.pedidoID);
      
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
  public pedido: any;
  public pedidoID: string;
  

  cargarPedido(id: string){
    
    this.pedidosService.loadPedidoOne(id)
        .subscribe( ({pedido}) => {

          this.pedido = pedido;
          console.log(pedido);
          
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

}
