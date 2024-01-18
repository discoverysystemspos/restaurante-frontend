import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Domicilio } from 'src/app/models/domicilios.model';
import { DomiciliosService } from 'src/app/services/domicilios.service';
import Swal from 'sweetalert2';

interface _query{
  desde: number,
  hasta: number,
  sort: any,
  estado?: string
}

@Component({
  selector: 'app-domicilios',
  templateUrl: './domicilios.component.html',
  styleUrls: ['./domicilios.component.css']
})
export class DomiciliosComponent implements OnInit {

  constructor(  private domiciliosService: DomiciliosService) { }

  ngOnInit(): void {
    this.loadDomicilios();
  }

  /** ================================================================
   *   SEARCH ESTADO
  ==================================================================== */
  public total: number = 0;
  public pendientes: number = 0;
  public enviandos: number = 0;
  public entregados: number = 0;
  searchEstado(estado: string){

    if (estado === 'total') {
      delete this.query.estado;
    }else{
      this.query.estado = estado;
    }
    
    this.loadDomicilios();
  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  @ViewChild('mostrar') mostrar!: ElementRef;
  cambiarPagina (valor: number){
    
    this.query.desde += valor;

    if (this.query.desde < 0) {
      this.query.desde = 0;
    }
    
    this.loadDomicilios();
    
  }

  /** ================================================================
   *   CHANGE LIMITE
  ==================================================================== */
  limiteChange( cantidad: any ){  

    this.query.hasta = Number(cantidad);    
    this.loadDomicilios();

  }


  /** ================================================================
   *   LOAD DOMICILIOS
  ==================================================================== */
  public domicilios: Domicilio[] = [];
  public domiciliosTemp: Domicilio[] = [];
  public query: _query = {
    desde: 0,
    hasta: 50,
    sort: {}
  }

  loadDomicilios(){

    this.domiciliosService.loadDomicilios(this.query)
        .subscribe( ({domicilios, total, pendientes, enviandos, entregados}) => {

          this.domicilios = domicilios;
          this.domiciliosTemp = domicilios;
          this.total = total;
          this.pendientes = pendientes;
          this.enviandos = enviandos;
          this.entregados = entregados;          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   SELECT DOMICILIOS
  ==================================================================== */
  public domSelect: Domicilio;
  public amountS: number = 0;
  selectDom(domicilio: Domicilio){

    this.amountS = 0;
    this.domSelect = domicilio;

    for (const dom of domicilio.carrito) {
      this.amountS += (dom.monto * dom.qty);
    }

  }

  /** ================================================================
   *  CAMBIAR ESTADO DEL PEDIDO
  ==================================================================== */
  changeEstado(estado: string){

    this.domiciliosService.updateDomicilios({estado}, this.domSelect.doid!)
        .subscribe( ({domicilio}) => {

          this.domSelect.estado = domicilio.estado;
          this.domicilios.map( domi => {
            if (domi.doid === domicilio.doid) {
              domi.estado = domicilio.estado;
            }
          })
          Swal.fire('Estupendo', 'Se ha cambiado el estado del domicilio exitosamente!', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

}
