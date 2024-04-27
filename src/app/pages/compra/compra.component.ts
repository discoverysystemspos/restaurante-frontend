import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Compra } from 'src/app/models/compras.model';
import { ComprasService } from 'src/app/services/compras.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compra',
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.css']
})
export class CompraComponent implements OnInit {

  constructor(  private activatedRoute: ActivatedRoute,
                private comprasService: ComprasService
  ) { 

    activatedRoute.params.subscribe( ({id}) => {
      
      this.cargarFactura(id);
      
    });

  }

  ngOnInit(): void {
  }

  /** ================================================================
   *   CARGAR FACTURA DE COMPRA
  ==================================================================== */
  public factura: Compra;
  cargarFactura(id: string){

    this.comprasService.loadCompraID(id)
        .subscribe( ({compra}) => {

          console.log(compra);
          this.factura = compra;
          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
          
        })

  }

}
