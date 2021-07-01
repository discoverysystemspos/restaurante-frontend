import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {

  transform( factura:string ): unknown {
    let numero = factura.split('#'); 
    return numero[1];
  }

}
