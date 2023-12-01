import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

import { Car } from 'src/app/models/cars.model';
import { Parqueo } from 'src/app/models/parqueo.model';
import { Typeparq } from 'src/app/models/typearq.model';
import { Datos } from 'src/app/models/empresa.model';
import { Impuestos } from 'src/app/models/impuestos.model';

import { CarsService } from 'src/app/services/cars.service';
import { ParqueoService } from 'src/app/services/parqueo.service';
import { TypeparqService } from 'src/app/services/typeparq.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { SearchService } from 'src/app/services/search.service';
import { TurnoService } from 'src/app/services/turno.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { LoadTurno, _movements } from 'src/app/interfaces/load-turno.interface';
import { EntradasService } from 'src/app/services/entradas.service';



@Component({
  selector: 'app-parqueadero',
  templateUrl: './parqueadero.component.html',
  styleUrls: ['./parqueadero.component.css']
})
export class ParqueaderoComponent implements OnInit {

  public user: User;

  constructor(  private fb: FormBuilder,
                private printerService: NgxPrinterService,
                private typeparqService: TypeparqService,
                private carsService: CarsService,
                private empresaService: EmpresaService,
                private impuestosService: ImpuestosService,
                private parqueoService: ParqueoService,
                private searchService: SearchService,
                private turnosService: TurnoService,
                private userService: UserService,
                private entradasService: EntradasService) { 

                  this.user = userService.user;

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => { console.log('Print window is open:', val) }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                }

  ngOnInit(): void {
    // CARGAR IMPUESTOSs
    this.cargarImpuestos();
    this.cargarDatos();
    this.loadCategorias();
    this.loadCars();
    this.loadParqueos();
    this.cargarTurno();
  }

  /** ================================================================
   *   CARGAR IMPUESTOS
  ==================================================================== */
  public impuestos: Impuestos[] = [];
  cargarImpuestos(){

    this.impuestosService.loadImpuestos()
        .subscribe( ({ taxes }) =>  {
          this.impuestos = taxes;
        });

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

    if (this.user.cerrada) {
      Swal.fire('Atención', 'Debes de abrir caja para poder ingresar los vehiculos al parqueadero', 'warning');
      return;
    }

    this.parqueoService.createParqueo({placa, checkin: new Date().getTime(), turno: this.user.turno})
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

          if (err.error.msg === 'No existe vehiculo con esta placa') {
            this.newCarForm.setValue({
              placa: placa,
              cliente: '',
              typeparq: 'none'
            })
          }

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
    let cal = 1000*60;
    if(parq.car.typeparq.type === 'Horas'){      
      cal = 1000*60*60;
    }

    let diff:number =  (new Date().getTime() - parq.checkin)/ cal;
    diff = parseFloat(diff.toFixed(2));

    if (diff < 1) {
      diff = 0;
    }

    let total:number = Math.round(diff * parq.car.typeparq.price);
    
    if (diff >= parq.car.typeparq.tplena ) {
      total = parq.car.typeparq.plena;
    }
    
    let subtotal:number = parseFloat(((total *100)/119).toFixed(2));
    let iva:number = parseFloat((total-subtotal).toFixed(2));
    
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
          total,
          subtotal,
          iva,
          estado: 'Finalizado',
        }
        
        this.parqueoService.updateParqueo(formData, parq.parqid)
            .subscribe( ({ parqueo }) => {

              this.vCheckout = parqueo;
              
              Swal.fire(` $ ${parqueo.total} `, `Total de tiempo en el parqueadero son ${diff}, en ${ parq.car.typeparq.type }` , 'success');
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
    hasta: 50,
    sort: {}
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
    price: ['', [Validators.required]],
    plena: '',
    tplena: '',
    type: 'Minutos',
    tax: 'none',
  })

  createCategory(){

    this.newCategorySubmitted = true;

    if (this.newCategoryForm.invalid) {
      return true;
    }

    this.typeparqService.createTypeparq(this.newCategoryForm.value)
        .subscribe( ({typeparq}) => {

          this.categories.push(typeparq);
          Swal.fire('Estupendo', 'Se ha creado la categoria exitosamente', 'success');
          this.newCategorySubmitted = false;
          this.newCategoryForm.reset({
            type: 'Minutos',
            tax: 'none',
          });

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
   *  SELECT CATEGORY
  ==================================================================== */
  public categoryID: string;
  selectCategory(category: Typeparq){

    this.categoryID = category.tpid;

    this.upCategoryForm.setValue({
      name: category.name,
      price: category.price,
      plena: category.plena,
      tplena: category.tplena,
      type: category.type,
      tax: category.tax._id,
    });

  }

  /** ================================================================
   *   UPDATE CATEGORY O TYPEPARQ
  ==================================================================== */
  public upCategorySubmitted: boolean = false;
  public upCategoryForm = this.fb.group({
    name: ['', [Validators.required]],
    price: ['', [Validators.required]],
    plena: '',
    tplena: '',
    type: 'Minutos',
    tax: 'none',
  })

  updateCategory(){

    this.upCategorySubmitted = true;
    
    if (this.upCategoryForm.invalid) {
      return;
    };
    
    this.typeparqService.updateTypeparq( this.upCategoryForm.value, this.categoryID )
    .subscribe( ({typeparq}) => {
      
          this.categories.map( cate => {
            if (cate.tpid === typeparq.tpid) {
              cate.name = typeparq.name;
              cate.price = typeparq.price;
              cate.plena = typeparq.plena;
              cate.tplena = typeparq.tplena;
              cate.type = typeparq.type;
              cate.tax = typeparq.tax;
            }
          });
      
          this.upCategorySubmitted = false;
          Swal.fire('Estupendo', 'Se ha actualizado la categoria exitosamente!', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        });

  }

  validateUpCategory(campo: string): boolean{
    if (this.upCategorySubmitted && this.upCategoryForm.get(campo)?.invalid) {
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
  public carsTemp: Car[] = [];
  public queryCar = {
    desde: 0,
    hasta: 50
  }

  loadCars(){

    this.carsService.loadCars(this.queryCar)
        .subscribe( ({cars}) => {
          this.cars = cars;
          this.carsTemp = cars;
        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   CREATE CAR
  ==================================================================== */
  @ViewChild('mVehiculo') mVehiculo: ElementRef;
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

    if (this.newCarForm.value.cliente === '') {
      this.newCarForm.value.cliente = 'Ocacional'
    }

    this.carsService.createCar(this.newCarForm.value)
        .subscribe( ({car}) => {

          this.cars.push(car);
          Swal.fire('Estupendo', 'Se ha creado el vehiculo exitosamente', 'success');
          this.newCarSubmitted = false;
          this.newCarForm.reset();

          this.checkin(car.placa);
          this.mVehiculo.nativeElement.click();

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

  /** ================================================================
   *   SELECT CAR
  ==================================================================== */
  public carID: string;
  selectCar( car: Car ){    

    this.carID = car.carid;

    this.upCarForm.setValue({
      placa: car.placa,
      cliente: car.cliente,
      typeparq: car.typeparq._id
    })

  }

  /** ================================================================
   *   UPDATE CAR
  ==================================================================== */
  public upCarSubmitted: boolean = false;
  public upCarForm = this.fb.group({
    placa: ['', [Validators.required]],
    cliente: '',
    typeparq: ['none', [Validators.required]],
  });

  updateCar(){

    this.upCarSubmitted = true;

    if (this.upCarForm.invalid) {
      return;
    }

    if (this.upCarForm.value.typeparq === 'none') {
      Swal.fire('Atención', 'Debes de seleccionar una categoria', 'warning');
      return;
    }

    this.carsService.updateCar(this.upCarForm.value, this.carID)
        .subscribe( ({car}) => {

          this.cars.map( carro => {
            if (carro.carid === car.carid) {
              carro.placa = car.placa;
              carro.cliente = car.cliente;
              carro.typeparq = car.typeparq;
            }
          });

          this.carsTemp.map( carro => {
            if (carro.carid === car.carid) {
              carro.placa = car.placa;
              carro.cliente = car.cliente;
              carro.typeparq = car.typeparq;
            }
          });

          this.upCarSubmitted = false;
          Swal.fire('Estupendo', 'El vehiculo se actualizo exitosamente!', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        });

  }

  validateUpCar(campo: string): boolean{
    if (this.upCarSubmitted && this.upCarForm.get(campo)?.invalid) {
      return true;
    }else{
      return false;
    }
  }

  /** ================================================================
   *   SEARCH CAR
  ==================================================================== */
  public sinResultados: boolean = false;
  public resultado: number = 0;
  searchCars(termino: string){

    this.sinResultados = true;

    if (termino.length === 0) {
      this.cars = this.carsTemp;
      this.resultado = 0;
      return;
    }else{
      
      this.sinResultados = true;

      let query = `hasta=20`;
      
      this.searchService.search('car', termino, true, query)
          .subscribe(({total, resultados}) => {
            
            // COMPROBAR SI EXISTEN RESULTADOS
            if (resultados.length === 0) {
              this.sinResultados = false;
              this.cars = [];
              this.resultado = 0;

              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS

            this.cars = resultados;
            this.resultado = resultados.length;

            

          }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

    }

  }

  /** ================================================================
   *   ABRIR CAJA
  ==================================================================== */
  abrirCaja(){
    
    if (!this.user.cerrada) {

      Swal.fire('Ya existe una caja abierta', 'Debes de cerrar caja para poder abrir he iniciar un turno nuevo', 'warning');
      return;

    }
    
    Swal.fire({
      title: 'Monto Inicial de caja',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      showLoaderOnConfirm: true,
      preConfirm: (resp) => {
        
        return resp;
      }
      }).then((result) => {

        if (result.value > 0) {

          const initial:number = result.value;

          const open = {
            initial
          };

          
          this.turnosService.createCaja(open)
            .subscribe( (resp:{ ok:boolean, turno:any}) => {
                this.userService.user.turno = resp.turno.tid;
                this.userService.user.cerrada = false;                
                this.cargarTurno();
            });  
              
          return;
        }else{
          return;
        }                
        
    });


  }

  /** ================================================================
   *   REGISTRAR ENTRADAS Y SALIDAS
  ==================================================================== */
  public turno: LoadTurno;
  cargarTurno(){

    if (this.user.cerrada === false) {
      
      this.turnosService.getTurnoId(this.user.turno)
          .subscribe( (turno) => {
            this.turno = turno;
            this.movimientos = turno.movements;                    
          });
    }

  }

  /** ================================================================
   *   REGISTRAR ENTRADAS Y SALIDAS
  ==================================================================== */
  @ViewChild('montoE') montoE: ElementRef;
  @ViewChild('descriptionE') descriptionE: ElementRef;
  @ViewChild('montoS') montoS: ElementRef;
  @ViewChild('descriptionS') descriptionS: ElementRef;

  public movimientos: _movements[] = [];

  entradaSalida(type: string, descripcion: string, monto: number){

    if (this.user.cerrada) {
      Swal.fire('Atención', 'Debes de abrir caja para registrar entradas y salidas', 'warning');
      return;
    }

    // COMPROBAR QUE NO VENGA VACIO
    if ( descripcion === '' || monto === 0) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return;      
    }
    // COMPROBAR QUE NO VENGA VACIO
    
    // COMPROBAR EL TIPO SALIDA
    if (type === 'salida') {
      monto = monto * -1;            
    }
    // COMPROBAR EL TIPO SALIDA
    
    // AGREGAR EL MOVIMIENTO AL OBJECTO
    this.movimientos.push({
      type,
      descripcion,
      monto
    });

    this.turno.movements = this.movimientos;
    // AGREGAR EL MOVIMIENTO AL OBJECTO
    
    // GUARDAR ACTUALIZAR EN LA BASE DE DATOS
    this.turnosService.updateTurno(this.turno, this.turno.tid)
    .subscribe((resp) => {
      
      this.montoE.nativeElement.value = '';
      this.descriptionE.nativeElement.value = '';
      
      this.montoS.nativeElement.value = '';
      this.descriptionS.nativeElement.value = '';

      let movi = {
        monto,
        descripcion,
        type,
        turno: this.user.turno,
      }

      this.entradasService.createMovimiento(movi)
          .subscribe( ({movimiento}) => {

            Swal.fire('Estupendo!', 'Se ha guardado exitosament', 'success')            

          }, (err) => {
            console.log(err);
            Swal.fire('Error', err.error.msg, 'error');            
          });

    }, (err) =>{
      Swal.fire('Error', err.error.msg, 'error');
    }); 
    // GUARDAR ACTUALIZAR EN LA BASE DE DATOS

  }

}
