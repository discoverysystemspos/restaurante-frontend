import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

import { Car } from 'src/app/models/cars.model';
import { Parqueo } from 'src/app/models/parqueo.model';
import { Typeparq } from 'src/app/models/typearq.model';

import { CarsService } from 'src/app/services/cars.service';
import { ParqueoService } from 'src/app/services/parqueo.service';
import { TypeparqService } from 'src/app/services/typeparq.service';
import { Observable, Subscription } from 'rxjs';
import { EmpresaService } from 'src/app/services/empresa.service';
import { Datos } from 'src/app/models/empresa.model';



@Component({
  selector: 'app-parqueadero',
  templateUrl: './parqueadero.component.html',
  styleUrls: ['./parqueadero.component.css']
})
export class ParqueaderoComponent implements OnInit {

  constructor(  private fb: FormBuilder,
                private printerService: NgxPrinterService,
                private typeparqService: TypeparqService,
                private carsService: CarsService,
                private empresaService: EmpresaService,
                private parqueoService: ParqueoService) { 

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {
                      console.log('Print window is open:', val);
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                }

  ngOnInit(): void {
    this.cargarDatos();
    this.loadCategorias();
    this.loadCars();
    this.loadParqueos();
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
   *   PRINTER
  ==================================================================== */
  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  printDiv(id: string) {
    this.printerService.printDiv(id);
  }
  

  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
   * PARQUEO PARQUEO
  /** ================================================================
   *   LOAD PARQUEOS
  ==================================================================== */
  public parqueos: Parqueo[] = [];
  loadParqueos(){

    this.parqueoService.loadParqueos({estado: 'Parqueado'})
        .subscribe( ({ parqueos }) => {

          this.parqueos = parqueos;
          console.log(parqueos);
          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   CHECKIN PARQUEO
  ==================================================================== */
  public vCheckin: Parqueo;
  @ViewChild('inP') inP: ElementRef;
  checkin(placa: string){

    if (placa.length === 0) {
      return;
    }

    this.parqueoService.createParqueo({placa})
        .subscribe( ({parqueo}) => {

          this.vCheckin = parqueo;

          this.parqueos.push(parqueo);

          this.inP.nativeElement.value = '';
          this.inP.nativeElement.focus = true;

          setTimeout( () => {
            this.printDiv('printDiv1')
          }, 1500 )
          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   CHECKOUT PARQUEO 
  ==================================================================== */
  public vCheckout: Parqueo;
  @ViewChild('outP') outP: ElementRef;
  checkout( placa: string ){

    let parq = this.parqueos.find( (p) => {
      return p.placa === placa.trim();
    });

    if (!parq) {
      Swal.fire('Error', 'No existe ningun vehiculo con esta placa en el parqueadero', 'warning');
      return
    }

    // CALCULAR DIFERENCIA
    let diff:number =  (new Date().getTime() - parq.checkin)/ (1000*60*60);
    diff = parseFloat(diff.toFixed(2));

    Swal.fire({
      title: "Estas seguro del checkout de este vehiculo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        
        let formData = {
          checkout: new Date().getTime(),
          total: Math.round(diff * parq.car.typeparq.price),
          estado: 'Finalizado',
        }

        this.parqueoService.updateParqueo(formData, parq.parqid)
            .subscribe( ({ parqueo }) => {

              this.vCheckout = parqueo;
              
              Swal.fire(` $ ${parqueo.total} `, `Total de horas en el parqueadero son ${diff}` , 'success');
              this.loadParqueos();
              this.outP.nativeElement.value = '';
              this.inP.nativeElement.focus = true;

              setTimeout( () => {
                this.printDiv('printDiv2')
              }, 1500 )

            }, (err) => {
              console.log(err);
              Swal.fire('Error', err.error.msg, 'error');              
            });

      }
    });
    
  }

  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
   * CATEGORIAS CATEGORIAS
  /** ================================================================
   *   LOAD CATEGORIES O TYPEPARQS
  ==================================================================== */
  public categories: Typeparq[] = [];
  public queryCat = {
    desde: 0,
    hasta: 50
  }
  loadCategorias(){

    

    this.typeparqService.loadTypeparqs(this.queryCat)
        .subscribe( ({typeparqs}) => {

          this.categories = typeparqs;          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   CREATE CATEGORY O TYPEPARQ
  ==================================================================== */
  public newCategorySubmitted: boolean = false;
  public newCategoryForm = this.fb.group({
    name: ['', [Validators.required]],
    price: [0, [Validators.required]],
  })

  createCategory(){

    this.newCategorySubmitted = true;

    if (this.newCategoryForm.invalid) {
      return true;
    }

    this.typeparqService.createTypeparq(this.newCategoryForm.value)
        .subscribe( ({typeparq}) => {

          typeparq.tpid = typeparq._id;
          this.categories.push(typeparq);
          Swal.fire('Estupendo', 'Se ha creado la categoria exitosamente', 'success');
          this.newCategorySubmitted = false;
          this.newCategoryForm.reset();

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  validateNewCategory(campo: string): boolean{
    if (this.newCategorySubmitted && this.newCategoryForm.get(campo)?.invalid) {
      return true;
    }else{
      return false;
    }
  }

  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
   * VEHICULOS VEHICULOS
  /** ================================================================
   *   LOAD VEHICULOS
  ==================================================================== */
  public cars: Car[] = [];
  public queryCar = {
    desde: 0,
    hasta: 50
  }

  loadCars(){

    this.carsService.loadCars(this.queryCar)
        .subscribe( ({cars}) => {
          this.cars = cars;
        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   CREATE CAR
  ==================================================================== */
  public newCarSubmitted: boolean = false;
  public newCarForm = this.fb.group({
    placa: ['', [Validators.required]],
    cliente: '',
    typeparq: ['none', [Validators.required]],
  })

  createCar(){

    this.newCarSubmitted = true;

    if (this.newCarForm.invalid) {
      return;
    }

    if (this.newCarForm.value.typeparq === 'none') {
      Swal.fire('Atención', 'No has seleccionado una categoria para este vehiculo', 'warning');
      return;
    }

    this.carsService.createCar(this.newCarForm.value)
        .subscribe( ({car}) => {

          this.cars.push(car);
          Swal.fire('Estupendo', 'Se ha creado el vehiculo exitosamente', 'success');
          this.newCarSubmitted = false;
          this.newCarForm.reset();

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  validateNewCar(campo: string): boolean{
    if (this.newCarSubmitted && this.newCarForm.get(campo)?.invalid) {
      return true;
    }else{
      return false;
    }
  }

}
