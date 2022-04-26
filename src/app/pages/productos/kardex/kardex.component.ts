import { Component, OnInit } from '@angular/core';

// MODELS
import { Department } from '../../../models/department.model';
import { Product } from '../../../models/product.model';

// SERVICES
import { DepartmentService } from '../../../services/department.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styles: [
  ]
})
export class KardexComponent implements OnInit {

  constructor(  private departmentService: DepartmentService,
                private productsService: ProductService) { }

  ngOnInit(): void {

    //CAARGAR DEPARTAMENTOS
    this.cargarDepartamnetos();

  }

  /** ===================================================================================
   * CARGAR DEPARTAMENTOS
  ================================================================================== */
  public departamentos: Department[] = [];
  cargarDepartamnetos(){

    this.departmentService.loadDepartment()
        .subscribe( ({departments}) => {

          this.departamentos = departments;

        });

  }

  /** ================================================================================
   * CARGAR PRODUCTOS
  ================================================================================== */
  public productos: Product[] = [];
  
  buscar( termino: string ){

    console.log(termino);
    

  }

}
