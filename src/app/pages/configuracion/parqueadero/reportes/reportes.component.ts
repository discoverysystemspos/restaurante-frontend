import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';

// EXCEL
import * as XLSX from 'xlsx';

import { Parqueo } from 'src/app/models/parqueo.model';
import { ParqueoService } from 'src/app/services/parqueo.service';

interface _query{
  desde: number,
  hasta: number,
  sort?: any,
  $and?: any
}

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  constructor(  private parqueoService: ParqueoService) { }

  ngOnInit(): void {

    this.loadParqueos();
  }

  /** ================================================================
   *   LOAD PARQUEOS
  ==================================================================== */
  public cargando: boolean = true;
  public total: number = 0;
  public parqueos: Parqueo[] = [];
  public parqueosTemp: Parqueo[] = [];
  public query: _query = {
    desde: 0,
    hasta: 50,
    sort: {}
  }

  loadParqueos(){    
    
    this.parqueoService.loadParqueos(this.query)
    .subscribe( ({ parqueos, total }) => {

        this.total = total;      
        this.parqueos = parqueos;
        this.parqueosTemp = parqueos;
        this.cargando = false;   
        
        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   BUSCAR PARQUEOS POR FECHAS
  ==================================================================== */
  buscar(desde: any, hasta: any){

    this.query.$and = [{ checkin: { $gte: new Date(desde).getTime(), $lt: new Date(hasta).getTime() } }]

    this.parqueoService.loadParqueos(this.query)
    .subscribe( ({ parqueos }) => {
      
        this.parqueos = parqueos;
        this.cargando = false;

    }, (err) => {
      console.log(err);
      Swal.fire('Error', err.error.msg, 'error');          
    })
    

  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  @ViewChild('mostrar') mostrar: ElementRef;
  cambiarPagina (valor: number){
    
    this.query.hasta = Number(this.mostrar.nativeElement.value);
    
    if (this.query.hasta > 10) {
      valor = valor * (this.query.hasta/10);      
    }
    
    this.query.desde += valor;
    
    if (this.query.desde < 0) {
      this.query.desde = 0;
    }else if( this.query.desde > this.total ){
      this.query.desde -= valor;
    }
    
    this.loadParqueos();
    
  }

  /** ================================================================
   *   CHANGE LIMITE
  ==================================================================== */
  limiteChange( cantidad: any ){    
    
    this.query.hasta = Number(cantidad);
    this.loadParqueos();
    
  }

  /** ================================================================
   *   EXPORTAR EXCEL
  ==================================================================== */
  exportar(){

    let parqueoList = [];
    let totalBase = 0;
    let totalIva = 0;
    let totalParq = 0;

    for (const parq of this.parqueos) {

      let usuario = `${parq.user.name}`;
      
      let { invoice, checkin, checkout, car, placa, subtotal, iva, total, estado } = parq;

      if (!subtotal) {
        subtotal = 0;
      }
      if (!total) {
        total = 0;
      }
      if (!iva) {
        iva = 0;
      }

      if (!checkout) {
        checkout = new Date().getTime();
      }

      parqueoList.push({
        invoice,
        cliente: car.cliente,
        checkin: `${new Date(checkin).getDate()}/${new Date(checkin).getMonth() + 1}/${new Date(checkin).getFullYear()} ${new Date(checkin).getHours()}:${new Date(checkin).getMinutes()}`, 
        checkout: `${new Date(checkout).getDate()}/${new Date(checkout).getMonth() + 1}/${new Date(checkout).getFullYear()} ${new Date(checkout).getHours()}:${new Date(checkout).getMinutes()}`, 
        categoria: car.typeparq.name, 
        placa, 
        subtotal, 
        iva, 
        total, 
        estado,
        por: usuario
      });

      totalBase += subtotal;
      totalIva  += iva;
      totalParq += total;

    }

    let datos = [
      {
        subtotal :totalBase,
        iva: totalIva,
        total: totalParq
      }
    ]

    parqueoList = parqueoList.concat(datos)

    /* generate a worksheet */
    var ws = XLSX.utils.json_to_sheet(parqueoList);

    /* add to workbook */
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    /* title */
    let title = `Reporte_${new Date().getDate()}_${new Date().getMonth() + 1}_${new Date().getFullYear()}.xls`;

    /* write workbook and force a download */
    XLSX.writeFile(wb, title);

  }

}
