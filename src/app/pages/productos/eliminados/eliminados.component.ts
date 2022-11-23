import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import Swal from 'sweetalert2';

// SERVICIOS
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-eliminados',
  templateUrl: './eliminados.component.html',
  styles: [
  ]
})
export class EliminadosComponent implements OnInit {

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  constructor(  private productService: ProductService) { }

  ngOnInit(): void {

    // CARGAR PRODUCTOS ELIMINADOS
    this.cargarProductos();
  }

  /** ================================================================
   *   CARGAR PRODUCTOS ELIMINADOS
  ==================================================================== */
  public productos: Product[] = [];
  public totalProductos: number = 0;
  public total: number = 0;
  cargarProductos(){

    this.cargando = true;
    this.sinResultados = true;

    this.productService.cargarProductosEliminados()
        .subscribe( ({products, total}) => {

          this.totalProductos = products.length;
          this.productos = products;
          this.total = total;
          this.cargando = false;

          
        }, (err) => {
          console.log(err.error);          
        }); 

  }

  /** ================================================================
   *   ACTIVAR Producto
  ==================================================================== */
  activarProducto(_id: string){

    Swal.fire({
      title: 'Atencion',
      text: "Estas seguro de Activar este producto?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Activar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {  
      
      if (result.isConfirmed) {

        this.productService.deleteProduct(_id)
        .subscribe((resp:{product, ok}) =>{

          if (resp.product.status) {
            Swal.fire('Estupendo', 'Se ha habilitado el Producto exitosamente!', 'success');
          }else{
            Swal.fire('Estupendo', 'Se ha eliminado el Producto exitosamente!', 'success');
          }          

          this.cargarProductos();

        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });

      }

    });

    
  }


  // FIN DE LA CLASE
}
