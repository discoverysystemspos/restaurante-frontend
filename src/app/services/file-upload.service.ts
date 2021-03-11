import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor() { }

  /** ================================================================
   *   GET TOKEN
  ==================================================================== */
  get token():string {
    return localStorage.getItem('token') || '';
  }

  /** ================================================================
   *   GET HEADERS
  ==================================================================== */
  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  /** ================================================================
   *   UPDATE IMAGES
  ==================================================================== */
  async updateImage(
    archivo: File,
    type: 'products' | 'logo' | 'user' | 'department',
    id: string
  ){

    try {
      
      const url = `${base_url}/uploads/${type}/${id}`;

      const formData = new FormData();
      formData.append('image', archivo);

      const resp = await fetch(url, {
        method: 'PUT',
        headers:{
          'x-token': localStorage.getItem('token') || ''
        },
        body: formData
      });

      const data = await resp.json();

      if (data.ok) {
        return data.nombreArchivo;
      }else{
        return false;

      }      
      
    } catch (error) {
      console.log(error);      
      return false;
    }

  }

}
