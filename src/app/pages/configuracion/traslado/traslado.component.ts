import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Datos } from 'src/app/models/empresa.model';
import { _productTraslados, Traslado } from 'src/app/models/traslados.model';
import { EmpresaService } from 'src/app/services/empresa.service';
import { ProductService } from 'src/app/services/product.service';
import { TrasladosService } from 'src/app/services/traslados.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-traslado',
  templateUrl: './traslado.component.html',
  styleUrls: ['./traslado.component.css']
})
export class TrasladoComponent implements OnInit {

  constructor(  private activatedRoute: ActivatedRoute,
                private trasladosService: TrasladosService,
                private productService: ProductService,
                private empresaService: EmpresaService
  ) { 

    activatedRoute.params.subscribe(({id}) => {
      this.loadTraslado(id);
    })

  }

  ngOnInit(): void {
    this.loadEmpresa();
  }

  /** ================================================================
    *   LOAD EMPRESA
  ==================================================================== */
  public empresa: Datos;
  loadEmpresa(){

    this.empresaService.getDatos()
        .subscribe( (datos) => {
          this.empresa = datos;
        })

  }

  /** ================================================================
    *   LOAD TRASLADOS
  ==================================================================== */
  public traslado: Traslado;
  public trasladoppal: Traslado;
  public desde: string;
  loadTraslado(id: string){

    this.trasladosService.loadTrasladoID(id)
        .subscribe( ({ traslado }) => {

          
          this.traslado = traslado;
          this.desde = this.traslado.desde.slice(0, -3)

          if (traslado.type === 'Recibido') {
            this.trasladosService.loadTrasladosBodega({desde: 0, hasta: 1, referencia: traslado.referencia}, traslado.desde)
                .subscribe( ({traslados}) => {
                  this.trasladoppal = traslados[0];
                }, (err) => {
                  console.log(err);                  
                })            
          }
          
        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
    *   CONFIRMAR LLEGADA
  ==================================================================== */
  llegada(){

    Swal.fire({
      title: "Estas seguro?",
      text: "De confirmar la llega de este traslado",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, confirmar!",
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {

        let fechaIn = new Date();

        this.trasladosService.updateTraslado({fechaIn, estado: 'Recibido'}, this.traslado.traid)
            .subscribe( ({traslado}) => {

              this.traslado.fechaIn = traslado.fechaIn;
              this.traslado.estado = traslado.estado;

              this.trasladosService.updateTrasladoBodega( {fechaIn, estado: 'Recibido'}, this.trasladoppal.traid, this.traslado.desde)
                  .subscribe( (resp) => {
                    this.trasladoppal = resp.traslado;
                  }, (err) => {console.log(err);})

            }, (err) => {console.log(err);})
        


      }
    });

    

  }

  /** ================================================================
   *   CONFIRMAR PRODUCTO
  ==================================================================== */
  confirmar(item: _productTraslados, i: any){
    
    this.productService.cargarProductoCodigo(item.code)
        .subscribe( (product) => {

          if (!product) {
            Swal.fire('Atención', 'Este producto no se encuentra en la base de datos', 'warning');
            return
          }

          let ajustar = {
            cantidad: item.qty,
            bought: item.qty,
            damaged: 0,
            type: 'Agrego'
          }
          
          // AJUSTAR INVENTARIO
          this.productService.ajustarInventario(product.pid, ajustar)
              .subscribe( () => {

                this.traslado.products[i].confirmado = true;

                this.trasladosService.updateTraslado({products: this.traslado.products}, this.traslado.traid)
                    .subscribe( () => {


                      this.trasladosService.updateTrasladoBodega({products: this.traslado.products}, this.trasladoppal.traid, this.traslado.desde)
                          .subscribe( () => {

                            Swal.fire('Estupendo', 'Se ha confirmado y agregado el producto exitosamente!', 'success');

                          })

                    })

              })

        }, (err) => {
          console.log(err);          
        })

  }

}
