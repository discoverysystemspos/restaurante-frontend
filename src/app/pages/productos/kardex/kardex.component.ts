import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { Subscription, Observable } from 'rxjs';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

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

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  constructor(  private departmentService: DepartmentService,
                private productsService: ProductService,
                private printerService: NgxPrinterService,) { 

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {
                      console.log('Print window is open:', val);
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;
              }

  ngOnInit(): void {

    //CAARGAR DEPARTAMENTOS
    this.cargarDepartamnetos();

  }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  printDiv() {
    this.printerService.printDiv('printDiv');
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
  public desde: number = 0;
  public endPoint: string;
  public productos: Product[] = [];

  public cargando: boolean = false;
  
  buscar( termino: string ){

    this.cargando = true;

    if (termino === 'Todos') {
      return;
    }else{
      this.endPoint = `?desde=${this.desde}&tipo=none&status=false&departamento=${termino}`;
    }


    this.productsService.cargarProductos(this.endPoint)
        .subscribe( ({ products }) => {

          this.productos = products;
          this.cargando = false;

        });    

  }

}
