import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styles: [
  ]
})
export class ConfiguracionComponent implements OnInit {

  constructor(  private productService: ProductService) { }

  ngOnInit(): void {
  }


  /** ================================================================
   *  RESETEAR INVENTARIO
  ==================================================================== */
  resetInvetary(){

    Swal.fire({
      title: 'Atencion',
      text: "Estas seguro de resetear todo el inventario?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, resetear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {  
      
      if (result.isConfirmed) {

        this.productService.resetInventario()
        .subscribe((resp:{ok: boolean, number: number}) =>{

          console.log(resp);
          Swal.fire('Estupendo', `Se han reseteado ${resp.number} productos`, 'success');
          
          
        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });

      }

    });

  }

}
