import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import Swal from 'sweetalert2';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// MODELS
import { Alquiler, _Items } from 'src/app/models/alquileres.model';
import { Banco } from 'src/app/models/bancos.model';
import { Datos } from 'src/app/models/empresa.model';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';

// SERVICES
import { AlquileresService } from 'src/app/services/alquileres.service';
import { BancosService } from 'src/app/services/bancos.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { TurnoService } from 'src/app/services/turno.service';
import { UserService } from 'src/app/services/user.service';
import { LoadTurno } from 'src/app/interfaces/load-turno.interface';
import { MesasService } from 'src/app/services/mesas.service';
import { Mesa } from 'src/app/models/mesas.model';
import { DataicoInterface } from 'src/app/interfaces/dataico.interface';
import { Impuestos } from 'src/app/models/impuestos.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { DataicoService } from 'src/app/services/dataico.service';
import { ElectronicaService } from 'src/app/services/electronica.service';
import { HttpClient } from '@angular/common/http';
import { Carrito, LoadCarrito } from 'src/app/interfaces/carrito.interface';
import { LoadInvoice } from 'src/app/interfaces/invoice.interface';
import { InvoiceService } from 'src/app/services/invoice.service';

interface _Department {
  codigo: string,
  departamento: string,
}

@Component({
  selector: 'app-alquiler',
  templateUrl: './alquiler.component.html',
  styleUrls: ['./alquiler.component.css']
})
export class AlquilerComponent implements OnInit {

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  public user: User;

  constructor(  private activateRoute: ActivatedRoute,
                private alquileresService: AlquileresService,
                private bancosService: BancosService,
                private empresaService: EmpresaService,
                private printerService: NgxPrinterService,
                private userService: UserService,
                private turnoService: TurnoService,
                private mesasService: MesasService,
                private modal: NgbModal,
                private impuestosService: ImpuestosService,
                private dataicoService: DataicoService,
                private electronicaService: ElectronicaService,
                private http: HttpClient,
                private invoiceService: InvoiceService) { 

                activateRoute.params.subscribe( ({id}) => {
                  this.loadAlquiler(id);                  
                })

                this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                  val => {
                    console.log('Print window is open:', val);
                  }
                );
            
                this.$printItems = this.printerService.$printItems;

                this.user = userService.user;

  }

  ngOnInit(): void {
    
    // CARGAR DATOS
    this.cargarDatos();

    // CARGAR BANCOS
    this.cargarBancos();

    // CARGAR BANCOS
    this.cargarTurno();

    // CARGAR BANCOS
    this.cargarMesasAll();

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
   *   CARGAR IMPUESTOS
  ==================================================================== */
  public impuestos: Impuestos[] = [];
  cargarImpuestos(){

    this.impuestosService.loadImpuestos()
        .subscribe( ({taxes}) => {
          this.impuestos = taxes;
        });

  }

  /** ================================================================
   *   CARGAR TODAS LAS MESAS
  ==================================================================== */
  public totalMesas: Mesa[] = [];
  cargarMesasAll(){

    this.mesasService.loadMesas(0)
        .subscribe( ({mesas}) => {
          
          for (const mesa of mesas) {
            if (mesa.disponible) {
              this.totalMesas.push(mesa);
            }
          }  
        });
  }

  /** ================================================================
   *   CARGAR TURNO
  ==================================================================== */
  public turno: LoadTurno;
  cargarTurno(){

    this.turnoService.getTurnoId(this.user.turno)
        .subscribe( (turno) => {
          this.turno = turno;
        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

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

          this.turnoService.createCaja(open)
              .subscribe( (resp:{ ok:boolean, turno:any}) => {

                this.userService.user.turno = resp.turno.tid;
                this.userService.user.cerrada = false;
                
              });  
              
          return;
        }else{
          return;
        }                
        
    });


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
   *   IMPRIMIR
  ==================================================================== */
  printDiv() {
    this.printerService.printDiv('printDiv');
  }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  printDiv2() {
    this.printerService.printDiv('printDiv2');
    setTimeout( () => {
      // Swal.fire('Success', `Se ha creado la factura <strong> #${ this.factura.invoice }</strong>, exitosamente`, 'success');
      Swal.fire({
        icon: 'success',
        title: `Factura #${ this.factura.invoice }`,
        text: `Se ha creado exitosamente`,
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: `ok`,
      }).then((result) => {
        window.location.reload();
      })       
    },1500);
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
   *   CARGAR ALQUILER
  ==================================================================== */
  public alquiler: Alquiler;
  loadAlquiler(id: string){

    this.alquileresService.loadAlquilerId(id)
        .subscribe( ({alquiler}) => {
          
          this.alquiler = alquiler;
          
          // CALCULAR LOS DIAS
          this.alquiler.items.map( (item) => {

            let desde: any = `${new Date(item.desde).getFullYear()}-${new Date(item.desde).getMonth()+1}-${new Date(item.desde).getDate()}`;
            let hasta: any = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`;

            if (item.entregado && item.hasta) {
              hasta = `${new Date(item.hasta).getFullYear()}-${new Date(item.hasta).getMonth()+1}-${new Date(item.hasta).getDate()}`;
            }

            let dias = ((new Date(hasta).getTime() - new Date(desde).getTime())/(1000*60*60*24));
            
            item.dias = dias;

          });

          this.sumarTotales();
          

        }, (err) => { 
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        });

  }

  /** ================================================================
   *   SUMAR TOTALES
  ==================================================================== */
  public amount: number = 0;
  public totalPagos: number = 0;
  sumarTotales(){

    this.amount = 0;
    this.totalPagos = 0;

    // SUMAR LOS MONTOS DE LOS PRODUCTOS
    for (const item of this.alquiler.items) {
      this.amount += ((item.price * item.qty) * item.dias);
    }

    // SUMAR LOS PAGOS
    for (const payment of this.alquiler.payments) {
      this.totalPagos += payment.amount;
    }

    this.vueltos = this.amount - this.totalPagos;

  }

  /** ================================================================
   *   ENTREGA DE PRODUCTOS
  ==================================================================== */
  entregaProductos(item: _Items){

    Swal.fire({
      title: `Cantidad de ${item.product.name} entregada`,
      input: 'number',
      inputValue: `${item.qty}`,
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      showLoaderOnConfirm: true,
      preConfirm: (qty) => {
        return qty
      },
    }).then((result) => {
      if (result.isConfirmed) {

        if (Number(result.value) === Number(item.qty)) {

          this.alquiler.items.map( (itemM) => {
            if (item.product === item.product) {
              itemM.entregado = true;
            }
          });          
          
        }else{

          this.alquiler.items.map( (itemM) => {
            if (item.product === item.product) {
              itemM.entregado = true;
              itemM.hasta = new Date();
            }
          });

          this.alquiler.items.push({
            product   : item.product,
            qty       : (Number(item.qty) - Number(result.value)),
            price     : item.price,
            desde     : new Date(),
            entregado : false
          })
          
        }

        this.alquileresService.updateAlquiler({items: this.alquiler.items}, this.alquiler.alid)
            .subscribe( ({alquiler}) => {

              this.loadAlquiler(this.alquiler.alid);

              Swal.fire('Estupendo', 'Se a agregado los items que faltaron por agregar', 'success');
              

            }, (err) => {
              console.log(err);
              Swal.fire('Error', err.error.msg, 'error');
              
            })
        
        
      }
    })

  }

  /** ================================================================
   *   AGREGAR PAGOS
  ==================================================================== */
  @ViewChild('montoAdd') montoAdd: ElementRef;
  public vueltos: number = 0;
  agregarPagos(type: string, description:string = ''){

    let amount = Number(this.montoAdd.nativeElement.value);

    if ((this.totalPagos + amount) > this.amount ) {
      this.vueltos = (this.totalPagos + amount) - this.amount;
      amount = this.amount - this.totalPagos;
    }

    this.alquiler.payments.push({
      type,
      amount,
      description,
      fecha: new Date(),
      turno: this.user.turno
    });

    this.sumarTotales();

    this.alquileresService.updateAlquiler({payments: this.alquiler.payments}, this.alquiler.alid!)
        .subscribe( ({alquiler}) => {
          
          let validarAl = this.turno.alquileres.find( (alq) => {

            if (alq.alquiler === this.alquiler.alid!) {
              return alq;
            }

          });
          if (validarAl) {
            Swal.fire('Estupendo', 'Se ha agregado el pago correctamente', 'success');
            return;
          }         

          this.turno.alquileres.push({alquiler: this.alquiler.alid!});

          this.turnoService.updateTurno( {alquileres: this.turno.alquileres}, this.turno.tid )
              .subscribe( (turno) => {

                Swal.fire('Estupendo', 'Se ha agregado el pago correctamente', 'success');
              }, (err) => {
                console.log(err);
                Swal.fire('Error', err.error.msg, 'error');
              });          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
          
        })
    

  }

  /** ================================================================
   *   ELIMINAR PAGOS
  ==================================================================== */
  eliminarPagos(i: number){

    Swal.fire({
      title: 'Estas seguro de eliminar este pago',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {

        this.alquiler.payments.splice(i, 1);
        this.sumarTotales();

        this.alquileresService.updateAlquiler({payments: this.alquiler.payments}, this.alquiler.alid!)
        .subscribe( ({alquiler}) => {

          Swal.fire('Estupendo', 'Se ha eliminado el pago correctamente', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
          
        })
      }
    })    

  }

  /** ================================================================
   *   LIQUIDAR
  ==================================================================== */
  liquidar(pago: number, typePay: string){
    
    this.alquiler.items.map( (itemM) => {
      if (!itemM.entregado) {
        itemM.entregado = true;
        itemM.hasta = new Date();
      }
    });

    this.alquiler.finalizada = true;
    
    let update: any = {
      items: this.alquiler.items, 
      finalizada: this.alquiler.finalizada,
    }

    if (pago > 0) {
      this.alquiler.payments.push({
        type: typePay,
        amount: pago,
        description: '',
        fecha: new Date()
      });

      update.payments = this.alquiler.payments;
    }


    this.alquileresService.updateAlquiler(update, this.alquiler.alid!)
    .subscribe( ({alquiler}) => {

      this.loadAlquiler(this.alquiler.alid!);

    }, (err) => {
      console.log(err);
      Swal.fire('Error', err.error.msg, 'error');
      
    })
  }
  
  /** ================================================================
   *   CREAR FACTURA
  ==================================================================== */
  public factura: LoadInvoice;
  public facturando: boolean = false;
  crearFactura(send_dian: boolean, mesa: Mesa, pago: number = 0, typePay: string){

    this.facturando = true;
    pago = Number(pago);

    if ((this.totalPagos + Number(pago)) < this.amount) {
      this.facturando = false;
      Swal.fire('Atención', 'Estas ingresando un monto inferior, al faltante por cancelar', 'warning');
      return;
    }else if((this.totalPagos + Number(pago)) > this.amount){
      pago = this.amount - this.totalPagos;
    }

    // AGREGAR PAGOS
    let payments: any[] = []
    payments.push({
      type: typePay,
      amount: pago,
      description: ''
    });

    let cost: number = 0;
    let iva: number = 0;
    let base: number = 0;
    let products: LoadCarrito[] = []

    this.impuestos.map( (impuesto) => {
      impuesto.total = 0;
    });

    for (const item of this.alquiler.items) {

      let ivaP:number = 0;

      if (item.product.tax) {
        ivaP = Number(item.product.price * item.qty) * Number(item.product.taxid?.valor / 100);      
      }

      products.push({
        qty: item.qty,
        product: item.product,
        price: ((item.price * item.qty) * item.dias) / item.qty,
        iva: ivaP
      })

    }

    // OTROS CALCULOS DE LA BASE - COSTOS IVA
    for (let i = 0; i < products.length; i++) {

      base += (products[i].price * products[i].qty);
      cost += (products[i].product.cost * products[i].qty);

      if (this.empresa?.decimal === false) {          
        this.amount = Math.round(this.amount);
        base = Math.round(base);
        cost = Math.round(cost);
      }
      

      // SUMAR IMPUESTOS
      if (this.empresa?.impuesto!) {          
        this.impuestos.map( (impuesto) => {            
          
          if (impuesto.taxid === products[i].product.taxid) {
            impuesto.total += products[i].iva;
          }

        })

        iva += Math.round(products[i].iva);         
        
      }
      // SUMAR IMPUESTOS
      
    }

    if (this.empresa?.impuesto) {
      this.amount += iva;
    }



    let invoice = {
      client: this.alquiler.client._id,
      type: typePay,
      amount: this.amount,

      products: products,
      cost,
      iva,
      base,

      payments: payments, //Arreglo de pagos
      credito: false,
      mesa: this.totalMesas[0].mid,
      mesero: this.totalMesas[0].mesero._id,
      fechaCredito: null,
      turno: this.turno.tid,
      pago: pago,
      vueltos: (this.totalPagos + pago) - this.amount,
      fecha: new Date(),
      paymentsAlquiler: this.alquiler.payments
    }    

    this.invoiceService.createInvoice( invoice , this.user.turno)
        .subscribe( (resp:{ok: boolean, invoice: LoadInvoice }) => {
          
          this.factura = resp.invoice;
          this.liquidar(pago, typePay);
          
          if (this.empresa.electronica && send_dian) {
                  
            this.electronicaService.postFacturaDataico(this.factura, this.dataico, this.impuestos)
                .subscribe( (resp: {status, invoice, ok}) => {

                  this.facturando = false;
                  
                  if (resp.status === 500) {
                    Swal.fire('Atención', 'No se pudo enviar la factura electronica a la DIAN, ve a la factura y vuelve a enviarla, si el problema persiste, ponte en contacto', 'warning');
                    window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                  }

                  if (this.empresa.printpos) {              
                    // window.open(`./dashboard/ventas/print/${ resp.invoice.iid }`, '_blank');
                    // IMPRIMIR FACTURA
                    setTimeout( () => {
                      this.printDiv2();                      
                    },2000);
                    
                  }else{
                    window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                    setTimeout( () => {             
                      window.location.reload();
                    },1000);
                  }
                  
                }, (err) => {
                  console.log(err);
                  
                });
            
            
          }else{

            if (this.empresa.printpos) {              
              // window.open(`./dashboard/ventas/print/${ resp.invoice.iid }`, '_blank');
              // IMPRIMIR FACTURA
              setTimeout( () => {
                this.printDiv2();                      
              },2000);
              
            }else{
              window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
              setTimeout( () => {             
                window.location.reload();
              },1000);
            }
          }

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        });
  }

  
  // FIN DE LA CLASE
}
