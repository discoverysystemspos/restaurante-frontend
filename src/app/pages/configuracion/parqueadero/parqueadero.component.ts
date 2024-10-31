import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
import { BancosService } from 'src/app/services/bancos.service';
import { Banco } from 'src/app/models/bancos.model';
import { MesasService } from 'src/app/services/mesas.service';
import { ProductService } from 'src/app/services/product.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { LoadInvoice } from 'src/app/interfaces/invoice.interface';
import { ElectronicaService } from 'src/app/services/electronica.service';
import { DataicoService } from 'src/app/services/dataico.service';
import { DataicoInterface } from 'src/app/interfaces/dataico.interface';
import { ClientService } from 'src/app/services/client.service';
import { Client } from 'src/app/models/client.model';
import { HttpClient } from '@angular/common/http';

interface _Department {
  codigo: string,
  departamento: string,
}

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
                private modal: NgbModal,
                private bancosService: BancosService,
                private mesasService: MesasService,
                private productService: ProductService,
                private invoiceService: InvoiceService,
                private electronicaService: ElectronicaService,
                private dataicoService: DataicoService,
                private clientService: ClientService,
                private http: HttpClient,
                private entradasService: EntradasService) { 

                  this.user = userService.user;

                  console.log(this.user);
                  

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => { console.log('Print window is open:', val) }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                }

  ngOnInit(): void {
    // CARGAR IMPUESTOSs
    this.cargarImpuestos();
    this.loadDataDataico();
    this.cargarDatos();
    this.loadCategorias();
    this.loadCars();
    this.loadParqueos();
    this.cargarTurno();
    this.cargarBancos();
    this.loadTicket();
    this.loadProduct();
    this.loadDepartmentAndCitys();
  }

  /** ================================================================
   *   CARGAR MESA
  ==================================================================== */
  public ticket: string = '';
  loadTicket(){

    this.mesasService.loadMesas(0)
        .subscribe( ({mesas}) => {
          
          this.ticket = mesas[0].mid;

        })

  }

  /** ================================================================
   *  OBTENER DATOS DE LA FACTURA ELECTRONICA
  ==================================================================== */
  public dataDataico: boolean = false;
  public dataico: DataicoInterface;
  loadDataDataico(){

    this.dataicoService.loadDataDataico()
        .subscribe( ({dataico}) => {

          delete dataico.actions._id;
          delete dataico.actions.email;
          delete dataico.actions.attachments;
          delete dataico.datid;
          delete dataico.customer;
          delete dataico.numbering._id;

          if (dataico) {
            this.dataDataico = true;
            this.dataico = dataico;
          }          

        }, (err) => {
          console.log(err);
          
        });

  }

  /** ================================================================
   *   CARGAR PRODUCTO
  ==================================================================== */
  public product: string = '';
  loadProduct(){

    this.productService.cargarProductoCodigo('0000000')
        .subscribe( (product) => {

          this.product = product.pid;
          

        })

  }

  /** ================================================================
   *   CARGAR BANCOS
  ==================================================================== */
  public bancos: Banco[] = [];
  cargarBancos(){

    this.bancosService.loadBancos()
        .subscribe( ({bancos}) => {

          this.bancos = bancos.filter( banco => banco.status === true);          

        });

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
  public ticketHeader: any;
  public ticketfooter: any;
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {
          this.empresa = datos;   
          
          this.ticketHeader =  this.empresa.header.split('\n');
          this.ticketfooter =  this.empresa.footer.split('\n');
          
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
  @ViewChild('btnV') btnV: ElementRef;
  @ViewChild('btnVC') btnVC: ElementRef;
  checkin(placa: string){

    if (placa.length === 0) {
      return;
    }

    if (this.user.cerrada) {
      Swal.fire('Atención', 'Debes de abrir caja para poder ingresar los vehiculos al parqueadero', 'warning');
      return;
    }

    let now = new Date();
    now.setSeconds(0, 0); // Establece los segundos y milisegundos a 0

    let timestamp = now.getTime(); // Obtiene el tiempo en milisegundos desde el 1 de enero de 1970

    this.parqueoService.createParqueo({placa, checkin: timestamp, turno: this.user.turno})
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

            this.btnV.nativeElement.click();
            this.btnVC.nativeElement.click();
          }

        })

  }

  /** ================================================================
   *   NUEVO MONTO
  ==================================================================== */
  newMonto(monto: any){

    monto = Number(monto);
    this.total = monto;

    this.subtotal = ((this.total *100)/(this.parq.car.typeparq.tax.valor + 100));
    this.iva = (this.total-this.subtotal);

  }


  /** ================================================================
   *   PAGOS
  ==================================================================== */
  @ViewChild ('montoP') montoP!: ElementRef;
  public payments: any[] = [];
  public restante: number = 0;
  addPay(monto: any, type: string){

    monto = Number(monto);
    if (this.payments.length > 0 && this.restante >= 0 ) {
      return;
    }

    if(monto > (this.restante * -1 ) && this.restante < 0){
      monto = (this.restante * -1);
    }

    this.payments.push({
      type,
      amount: monto,
      description: ''
    });

    this.restante = 0;
    for (const pay of this.payments) {
      this.restante = this.restante + pay.monto;
    }

    this.restante = this.restante - this.total;    

  }

  delPay(pay: any){    

    this.payments.splice( pay, 1 );
    this.restante = 0;
    for (const pay of this.payments) {
      this.restante = this.restante + pay.monto;
    }

    this.restante = this.restante - this.total;

  }


  /** ================================================================
   *   CHECKOUT PARQUEO 
  ==================================================================== */
  public vCheckout: Parqueo;
  @ViewChild('modalCheckOut', { static: true }) modalCheckOut: TemplateRef<any>;
  @ViewChild('outP') outP: ElementRef;
  public total: number = 0;
  public subtotal: number = 0;
  public iva: number = 0;
  public parq: any;
  public diff: any;
  checkout( placa: string ){
    
    this.payments = [];
    this.total = 0;
    this.subtotal = 0;
    this.iva = 0;


    let parq = this.parqueos.find( (p) => {
      return p.placa === placa.trim();
    });

    if (!parq) {
      Swal.fire('Error', 'No existe ningun vehiculo con esta placa en el parqueadero', 'warning');
      return
    }

    this.parq = parq;

    // CALCULAR DIFERENCIA
    let cal = 1000*60;
    if(parq.car.typeparq.type === 'Horas'){      
      cal = 1000*60*60;
    }
    
    this.diff =  (new Date().getTime() - parq.checkin)/ cal;
    this.diff = parseFloat(this.diff.toFixed(2));
    
    if (this.diff < 1 && parq.car.typeparq.type !== 'Horas') {
      this.diff = 0;
    }

    // REDONDEAR AL NUMERO MENOR SI SON MINUTOS
    if(parq.car.typeparq.type === 'Minutos'){      
      if (this.diff > 0) {        
        this.diff = Math.floor(this.diff);
      }      
    }

    this.total = this.diff * parq.car.typeparq.price;    
    
    if (this.total < parq.car.typeparq.price) {
      this.total = parq.car.typeparq.price;      
    }
    
    if (this.diff >= parq.car.typeparq.tplena ) {
      this.total = parq.car.typeparq.plena;
    }
   
    
    this.subtotal = parseFloat(((this.total *100)/(parq.car.typeparq.tax.valor + 100)).toFixed(2));
    this.iva = parseFloat((this.total-this.subtotal).toFixed(2));

    this.modal.open(this.modalCheckOut);

    
  }

  /** ================================================================
   *   CREAR FACTURA
  ==================================================================== */
  public factura: LoadInvoice;
  public facturando: boolean = false;
  crearFactura( send_dian: boolean ){

    this.facturando = true;

    let formData = {
      checkout: new Date().getTime(),
      total: this.total,
      subtotal: this.subtotal,
      iva: this.iva,
      estado: 'Finalizado',
    }
    
    this.parqueoService.updateParqueo(formData, this.parq.parqid)
        .subscribe( ({ parqueo }) => {

          this.vCheckout = parqueo;
          
          Swal.fire(` $ ${parqueo.total} `, `Total de tiempo en el parqueadero son ${this.diff}, en ${ this.parq.car.typeparq.type }` , 'success');
          this.loadParqueos();
          this.outP.nativeElement.value = '';
          this.inP.nativeElement.focus = true;

          let data: any = {
            amount: this.total,
            cost: 0,
            type: 'efectivo',
            payments: this.payments, 
            products: [{
              product: this.product,
              qty: 1,
              price: this.subtotal
            }],
            credito: false,
            mesa: this.ticket,
            mesero: this.user.uid,
            fechaCredito: '',
            turno: this.user.turno,
            iva: this.iva,
            base: this.subtotal,
            pago: this.total,
            vueltos: 0,
            nota: '',
            apartado: false,
            descuento: false,
            porcentaje: 0,
            fecha: new Date(),
            tip: 0,
            datafon: 0,
          }

          if (this.clienteTemp) {
            data.client = this.clienteTemp.cid;
          }

          this.invoiceService.createInvoice(data, this.user.turno)
              .subscribe( (resp:{ok: boolean, invoice: LoadInvoice } ) => {

                this.factura = resp.invoice;

                delete this.clienteTemp;

                if (this.empresa.electronica && send_dian) {
                  
                  this.electronicaService.postFacturaDataico(this.factura, this.dataico, this.impuestos)
                      .subscribe( (resp: {status, invoice, ok}) => {
                                                
                        if (resp.status === 500) {
                          Swal.fire('Atención', 'No se pudo enviar la factura electronica a la DIAN, ve a la factura y vuelve a enviarla, si el problema persiste, ponte en contacto', 'warning');
                          window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                        }

                        if (resp.invoice.cufe) {
                          this.factura.cufe = resp.invoice.cufe;
                          this.factura.number = resp.invoice.number;
                        }

                        this.payments = [];
                        this.total = 0;
                        this.subtotal = 0;
                        this.iva = 0;
                        this.modal.dismissAll('modalCheckOut');

                        if (this.empresa.printpos) {              
                          // window.open(`./dashboard/ventas/print/${ resp.invoice.iid }`, '_blank');
                          // IMPRIMIR FACTURA
                          setTimeout( () => {
                            this.facturando = false;
                            this.printDiv('printDiv2')
                          }, 1500 )
                          
                        }else{
                          window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                          setTimeout( () => {   
                            this.facturando = false;          
                            window.location.reload();
                          },1000);
                        }
                        
                      }, (err) => {
                        console.log(err);
                        
                      });
                  
                  
                }else{

                  this.payments = [];
                  this.total = 0;
                  this.subtotal = 0;
                  this.iva = 0;
                  
                  if (this.empresa.printpos) {              
                    // window.open(`./dashboard/ventas/print/${ resp.invoice.iid }`, '_blank');
                    // IMPRIMIR FACTURA
                    setTimeout( () => {
                      this.facturando = false;
                      this.modal.dismissAll('modalCheckOut');
                      this.printDiv('printDiv2')
                    }, 1500 )
                    
                  }else{
                    window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                    setTimeout( () => {             
                      window.location.reload();
                    },1000);
                  }
                }

                

              })


        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');              
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

  /** ================================================================
   *  OBTENER DEPARTAMENTOS Y CIUDADES
  ==================================================================== */
  public departments: _Department[] = [];
  public cities: any[] = [];
  loadDepartmentAndCitys(){

    this.http.get('assets/json/departamentos.json')
        .subscribe( (data: any) => {          
          this.departments = data;            
        });

    this.http.get('assets/json/ciudades.json')
    .subscribe( (data: any) => {          
      this.cities = data;          
    })

  }

    /** ================================================================
   *  OBTENER CIUDADES DEPENDIENDO DEL DEPARTAMENTO
  ==================================================================== */
  public ListCities: any[] = [];
  searchCities(department: string){

    this.ListCities = [];

    if (department.length === 0 ) {
      return;
    }

    this.ListCities = this.cities.filter( city =>  department === city.departamento );

  }

  /** ============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * CLIENTES - CLIENTES - CLIENTES - CLIENTES  
  ==================================================================== */
  public listaClientes: Client[] = [];
  public listaClientesTemp: Client[] = [];
  public totalClientes: number = 0;
  public clienteTemp: Client;

  /** ================================================================
   *  BUSCAR CLIENTE
  ==================================================================== */
  public sinResultadosClientes: boolean = false;
  public cargandoCliente: boolean = true;

  buscarCliente(termino: string){
    
    this.cargandoCliente = false;
    this.sinResultadosClientes = false;

    if (termino.length === 0) {
      this.listaClientes = this.listaClientesTemp;
      this.sinResultadosClientes = true;
      this.cargandoCliente = true;
      return;
    }else{
    
      this.searchService.search('clients', termino)
          .subscribe(({total, resultados}) => {   
            
          this.cargandoCliente = false;
          
          // COMPROBAR SI EXISTEN RESULTADOS
          if (resultados.length === 0) {
            this.listaClientes = [];
            this.totalClientes = 0;
            this.sinResultadosClientes = true;
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS
          
          this.listaClientes = resultados;
          this.totalClientes = total;

        });
    }

  }

  /** ================================================================
   *  SELECCIONAR CLIENTE searchClient
  ==================================================================== */
  @ViewChild('searchClient') searchClient: ElementRef;
  seleccionarCliente(cliente: Client){
    
    this.clienteTemp = cliente;

    this.listaClientes = [];
    this.totalClientes = 0;
    this.cargandoCliente = true;
    this.sinResultadosClientes = false;    
        
  }

  /** ================================================================
   *  CREAR CLIENTE
  ==================================================================== */
  @ViewChild('btnCreateClient') btnCreateClient: ElementRef<any>;
  public formSubmitted: boolean = false;
  public newClientForm = this.fb.group({
    party_type: ['PERSONA_NATURAL', [Validators.required]],
    tax_level_code: ['NO_RESPONSABLE_DE_IVA', [Validators.required]],
    party_identification_type: ['CC', [Validators.required]],
    company_name: '',
    first_name: '',
    family_name: '',
    department: '',
    address_line: '',
    regimen: ['SIMPLE',],
    party_identification: '',
    codigodepartamento: '',
    codigociudad: '',
    sendemail: false,
    // OLD
    name: '',
    cedula: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    city: '',
    address: ['', [Validators.required]]
  });
  

  async crearCliente(){    

    this.formSubmitted = true;

    if (this.newClientForm.invalid) {
      return;
    }

    // OBTENER CODIGO DEL DEPARTAMENTO Y CIUDAD
    let codigoD = await this.departments.find( departamento => this.newClientForm.value.department === departamento.departamento );
    let codigoC = await this.cities.find( city => this.newClientForm.value.city === city.ciudad );
    this.newClientForm.value.codigodepartamento  = codigoD.codigo;
    this.newClientForm.value.codigociudad  = codigoC.codigo;

    if (this.newClientForm.value.party_type === 'PERSONA_NATURAL') {      
      this.newClientForm.value.name = `${this.newClientForm.value.first_name} ${this.newClientForm.value.family_name}`
    }else{
      this.newClientForm.value.name = this.newClientForm.value.company_name;
    }

    this.newClientForm.value.party_identification = this.newClientForm.value.cedula;

    this.clientService.createClient(this.newClientForm.value)
        .subscribe((resp: any) => {

          Swal.fire('Estupendo', 'Se ha creado el cliente exitosamente!', 'success');

          this.formSubmitted = false;
          this.newClientForm.reset();          
          
        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });

  }

  /** ================================================================
   *  CAMPO VALIDO
  ==================================================================== */
  campoValido(campo: string): boolean{

    if (this.formSubmitted && this.newClientForm.get(campo).invalid) {
      return true;
    }else{
      return false;
    }
  
  }

}
