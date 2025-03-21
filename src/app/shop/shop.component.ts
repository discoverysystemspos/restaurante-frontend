import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';
import Swal from 'sweetalert2';
import { Datos } from '../models/empresa.model';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/department.model';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {

  constructor(  private empresaService: EmpresaService,
                private departmentService: DepartmentService,
                private productService: ProductService
  ) { }

  ngOnInit(): void {

    this.cargarDatos();
    this.loadDeparments();
    this.loadProducts();

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
   *   CARGAR DEPARTAMENTOS
  ==================================================================== */
  public departamentos: Department[] = [];
  loadDeparments(){

    this.departmentService.loadDepartment()
        .subscribe( ({departments}) => {

          this.departamentos = departments;

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); })

  }

  /** ================================================================
   *   CARGAR PRODUCTOS
  ==================================================================== */
  public products: Product[] = [];
  public total: Number = 0;
  public queryP: any = {
    desde: 0,
    hasta: 50,
    status: true,
    visibility: true,
    low: false,
    sort: {}
  }

  loadProducts(){

    this.productService.searchQueryProducts(this.queryP)
        .subscribe( ({products, total}) => {

          this.products = products;
          this.total = total;

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

}
