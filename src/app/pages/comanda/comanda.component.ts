import { Component, OnInit, QueryList, ViewChildren, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { Subscription, Observable } from 'rxjs';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// MODELS
import { Mesa } from '../../models/mesas.model';
import { MesasService } from '../../services/mesas.service';
import { UserService } from '../../services/user.service';
import { Carrito, LoadCarrito } from '../../interfaces/carrito.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-comanda',
  templateUrl: './comanda.component.html',
  styles: [
  ]
})
export class ComandaComponent implements OnInit {

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  public listaMesas: Mesa[] = [];
  public listaMesasTemp: Mesa[] = [];
  public totalMesas: number = 0;

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;
  public user:User;

  constructor(  private mesasService: MesasService,
                private printerService: NgxPrinterService,
                private router: Router,
                private userService:UserService) {

                  const reloadMesa = setInterval( () => {

                    let ruta = window.location.href;
                    let rutaArray = ruta.split('/');
                  
                    if (rutaArray[rutaArray.length - 1] !== 'comandas' ) {
                      clearInterval(reloadMesa);
                    }else{
                      this.cargarMesas();
                    }
            
                  }, 5000);

                  // IMPRIMIR
                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {  

                      console.log('Print window is open:', val);
                      
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                  this.user = userService.user;

                  if (!userService.user.privilegios.comandas) {
                    Swal.fire('Atención', 'No tienes los privilegios para el modulo de comandas', 'warning');
                    this.router.navigateByUrl('/');
                    return
                  }

                }

  ngOnInit(): void {

    // CARGAR MESAS
    this.cargarMesas();
  }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  printDiv(imprimir: string, tipo: any[]) {

    this.printerService.printDiv(imprimir);

    tipo.map( (item) => {

      if (item.estado === 'pendiente') {
        this.cambiarEstado(this.comanda.comanda, item.product, 'Preparando', this.comanda);
      }

    });

  }

  /** ================================================================
   *   CARGAR MESAS
  ==================================================================== */
  public pendientes: number = 0;
  public preparandos: number = 0;
  public entregados: number = 0;
  cargarMesas(){
    
    this.cargando = true;
    this.sinResultados = true;

    let pendientes = 0;
    let preparandos = 0;
    let entregados = 0;

    this.mesasService.loadMesasComanda()
        .subscribe(({ total, mesas }) => {
          this.totalMesas = total;
          this.listaMesas = mesas;         

          for (const mesa of mesas) {
            mesa.comanda.map( (me) => {

              if (me.estado === 'pendiente') {
                pendientes ++;
              }else if(me.estado === 'Preparando'){
                preparandos ++;
              }else{
                entregados ++;
              }

            })
          }

          this.pendientes = pendientes;
          this.preparandos = preparandos;
          this.entregados = entregados;
          

        });    
  }

  /** ================================================================
   *   CAMBIAR EL ESTADO DE LA COMANDA
  ==================================================================== */
  public carrito: LoadCarrito[]= [];
  public mesa: Mesa;
  cambiarEstado(carrito:any, id: any, estado:any, mesa:Mesa){
    

    this.carrito = [];
    this.carrito = carrito;

    this.carrito.map( (cart) =>{

      if (cart.product === id) {

        // VERIFICAR EL ROLE
        if (this.user.role === 'WAITER' || this.user.role === 'WAITERALL') {

          // VERIFICAR EL ESTADO
          if (estado === 'pendiente' || cart.estado === 'Entregado' || estado === 'Preparando' && cart.estado === 'Entregado') {
            Swal.fire('Atención', 'no puedes volver a un estado anterior', 'warning');
            return;
          }

          cart.estado = estado;
          
        }else{
          cart.estado = estado;
        }

      }

    })

    this.mesa = mesa;
    const mesaID = mesa.mid;

    this.mesasService.updateMesa(this.mesa, mesaID)
        .subscribe( (resp:{ok: boolean, mesa: any}) => {

          this.comandaModal(this.mesa);

        })

  }

  /** ================================================================
   *   SCROLL AL FONDO
  ==================================================================== */
  @ViewChildren('messages') messages: QueryList<any>;
  @ViewChild('content') content: ElementRef;

  ngAfterViewInit() {
    this.scrollToBottom();
    this.messages.changes.subscribe(this.scrollToBottom);
  }

  scrollToBottom = () => {
    try {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    } catch (err) {}
  }

  /** ================================================================
   *   COMANDA
  ==================================================================== */
  public comanda: Mesa;
  public barra    =  [];
  public bebidas  =  [];
  public cocina   =  [];
  comandaModal(comanda: Mesa){

    this.cocina = [];
    this.barra = [];
    this.bebidas = [];

    this.comanda = comanda;

    comanda.comanda.map( (item) => {

      if (item.product.tipo === 'Cocina') {
        this.cocina.push(item);
      }else if(item.product.tipo === 'Barra'){
        this.barra.push(item);
      }else if(item.product.tipo === 'Bebidas'){
        this.bebidas.push(item);
      }

    });

  }

}
