import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// SERVICES
import { MesasService } from '../services/mesas.service';
import { ProductService } from '../services/product.service';
import { SearchService } from '../services/search.service';
import { ClientService } from '../services/client.service';
import { DepartmentService } from '../services/department.service';
import { EmpresaService } from '../services/empresa.service';
import { Carrito, LoadCarrito, _notas } from '../interfaces/carrito.interface';
import { Mesa, _comanda, _ingredientes } from '../models/mesas.model';
import { Datos } from '../models/empresa.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(  private mesaService: MesasService,
                private searchService: SearchService,
                private producService: ProductService,
                private departmentService: DepartmentService,
                private clientService: ClientService,
                private empresaService: EmpresaService,
                private activatedRoute: ActivatedRoute,
                private router: Router
                ) { }

  ngOnInit(): void {

    // CARGAR MESA
    this.activatedRoute.params.subscribe( ({id}) => {

      this.mesaID = id;
      
      this.cargarMesa(id);
      
    });

  };

  /** ================================================================
   *  CARGAR DATOS DE LA MESA
  ==================================================================== */
  public mesaID: string;
  public carrito: LoadCarrito[] = [];
  public comanda: LoadCarrito[] = [];
  public comandaTemp: LoadCarrito[] = [];
  public mesa: Mesa;
  public empresa: Datos;
  public total: number = 0;
  public comandas: _comanda[] = [];
  public ingredientes: _ingredientes[] = [];
  public productUp: Carrito[] = [];
  public notas: _notas[] = [];

  cargarMesa(id:string){
    
    this.mesaService.loadMesaId(id)
        .subscribe( (mesa:any) => {

          this.mesaID = mesa.mid;
          this.carrito = mesa.carrito;
          this.mesa = mesa;
          
          this.comandas = mesa.comanda;

          for (let i = 0; i < mesa.carrito.length; i++) {

            this.productUp.push({
              product: mesa.carrito[i].product._id,
              qty: mesa.carrito[i].qty,
              price: mesa.carrito[i].price
            });
            
            this.comanda.push({
              product: mesa.carrito[i].product.name,
              tipo: mesa.carrito[i].product.tipo,
              comanda: mesa.carrito[i].product.comanda,
              qty: mesa.carrito[i].qty,
              price: mesa.carrito[i].price
            });
                        
          }

          this.comandaTemp = this.comanda;

          // OBTENER NOTAS DE LA COMANDAS
          if (this.mesa.nota.length > 0) {
            this.notas = this.mesa.nota;         
          }else{
            this.notas = [];
          }
          

          // this.sumarTotales();
          

        }, (err) => { 
          Swal.fire('Error', 'La pagina que estas buscando no existe, ponte en contacto con alguien de la empresa', 'error');
          this.router.navigateByUrl('/404');
          return;
        });

  }



  // FIN DE LA CLASE
}
