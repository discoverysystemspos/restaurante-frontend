import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';

// SERVICES
import { InvoiceService } from '../../../services/invoice.service';

// INTERFACES
import { LoadInvoice } from '../../../interfaces/invoice.interface';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styles: [
  ]
})
export class FacturaComponent implements OnInit {

  public factura: LoadInvoice;

  constructor(  private invoiceService: InvoiceService,
                private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe( ({id}) => {
      
      this.cargarFactura(id);
      
    });

  }

  /** ================================================================
   *   CARGAR FACTURA
  ==================================================================== */
  cargarFactura(id: string){
    
    this.invoiceService.loadInvoiceId(id)
        .subscribe( invoice => {

          this.factura = invoice;         

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

              console.log(resp);
              
              Swal.fire(
                'Devolución exitosa!',
                'Esta factura, se ha devuelto exitosamente con todos los productos de la misma!',
                'success'
              );

            }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

      }
    })

  }


  // FIN DE LA CLASE
}
