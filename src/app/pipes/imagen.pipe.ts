import { Pipe, PipeTransform } from '@angular/core';

import { environment } from "../../environments/environment"

const base_url = environment.base_url;
const local_url = environment.local_url;

@Pipe({
  name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

  transform(img: string, tipo: 'products' | 'logo' | 'user' | 'department' | 'taller' = 'taller'): string {
    if (img) {            
        return `${base_url}/uploads/${tipo}/${img}`;
    }else{
        return `${base_url}/uploads/${tipo}/no-image`;
    }
  }

}
