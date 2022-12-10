import { Pipe, PipeTransform } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';
import { Datos } from '../models/empresa.model';

@Pipe({
  name: 'divisa'
})
export class DivisaPipe implements PipeTransform {

  public empresa: Datos;
  constructor(  private empresaService: EmpresaService){
    this.empresa = this.empresaService.myEmpresa;
  }

  transform(monto: any, moneda: 'COP' | 'USD' | 'BS' | 'none' = 'none'): any {

    if (moneda === 'none') {

      if(!this.empresa.moneda){
        this.empresa.moneda = 'COP';
      }

    }else{
      this.empresa.moneda = moneda;
    }

        
    if (!this.empresa.decimal) {
      monto =  Math.round(monto) ;      
    }else{
      monto = Number.parseFloat(monto).toFixed(2) ;
    }
    
    let newMonto:any;
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';

    // AGREGAR SEPARADORES
    monto = monto.toString().split('.');
    monto[0] = monto[0].replace(exp,rep);
    monto[1] ? monto.join('.'): monto[0];
    // AGREGAR SEPARADORES    
    
    if (this.empresa.moneda === 'COP') {
      newMonto = `$${monto}`;
    }else if(this.empresa.moneda === 'USD'){
      newMonto = `${monto}$`;
    }else if(this.empresa.moneda === 'BS'){
      newMonto = `${monto}bs`;
    }

    return newMonto;
  }


}
