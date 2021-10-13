import { Component, OnInit, QueryList, ViewChildren, ElementRef, ViewChild } from '@angular/core';

// MODELS
import { Mesa } from '../../models/mesas.model';
import { MesasService } from '../../services/mesas.service';
import { UserService } from '../../services/user.service';
import { Carrito, LoadCarrito } from '../../interfaces/carrito.interface';

@Component({
  selector: 'app-comanda',
  templateUrl: './comanda.component.html',
  styles: [
  ]
})
export class ComandaComponent implements OnInit {

  public listaMesas: Mesa[] = [];
  public listaMesasTemp: Mesa[] = [];
  public totalMesas: number = 0;

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  constructor(  private mesasService: MesasService,
                private userService:UserService) {

                  const reloadMesa = setInterval( () => {

                    let ruta = window.location.href;
                    let rutaArray = ruta.split('/');
                  
                    if (rutaArray.length > 5 ) {
                      clearInterval(reloadMesa);
                    }else if (rutaArray[4] === 'comandas'){                      
                      this.cargarMesas();          
                    }else{
                      clearInterval(reloadMesa);
                    }
            
                  }, 5000);

                }

  ngOnInit(): void {

    // CARGAR MESAS
    this.cargarMesas();
  }

  /** ================================================================
   *   CARGAR MESAS
  ==================================================================== */
  cargarMesas(){

    this.cargando = true;
    this.sinResultados = true;

    this.mesasService.loadMesasComanda()
        .subscribe(({ total, mesas }) => {    

          this.totalMesas = total;
          this.listaMesas = mesas;

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

    const validarItem = this.carrito.findIndex( (resp) =>{    
      if (resp.product === id ) {
        return true;
      }else {
        return false;
      }
    });

    this.carrito[validarItem].estado = estado;

    this.mesa = mesa;
    const mesaID = mesa.mid;

    this.mesasService.updateMesa(this.mesa, mesaID)
        .subscribe( (resp:{ok: boolean, mesa: any}) => {

          console.log(resp.mesa);

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

}
