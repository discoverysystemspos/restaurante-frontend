// src/app/services/printer.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import qz from 'qz-tray';

import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  constructor(  private http:HttpClient) {
    // Configurar certificados si los usas (opcional)
    qz.api.setPromiseType(function promise(resolver) {
      return new Promise(resolver);
    });
  }

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

  // openCashDrawer(){

  //   return this.http.post<{ok: boolean, msg: string}>(`http://localhost:3001/open-cashdrawer`, {printerType: 'USB'});

  // }

  pingCajon(){

    return this.http.get<{ok: boolean, msg: string}>(`http://localhost:3001/ping`);

  }
  
  async openConnection(): Promise<void> {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
      console.log('Conectado a QZ Tray');
    }
  }

  async openCashDrawer(): Promise<void> {
    try {
      await this.openConnection();
      const printer = await qz.printers.getDefault(); // Usa la impresora predeterminada
      const config = qz.configs.create(printer);

      // Comando ESC/POS para abrir el cajón
      const data = [
        { type: 'raw', format: 'hex', data: '1B700019FA' } // ESC p 0 25 250
      ];

      await qz.print(config, data);
      console.log('💵 Cajón abierto correctamente');
      setTimeout( () => {             
        window.location.reload();
      },1000);
    } catch (err) {
      window.location.reload();
      console.error('Error al abrir cajón:', err);
      alert('Error al abrir el cajón. Asegúrate de tener QZ Tray encendido.');
    }
  }

  async disconnect(): Promise<void> {
    if (qz.websocket.isActive()) {
      await qz.websocket.disconnect();
    }
  }

  /** ================================================================
   *   Imprimir
  ==================================================================== */
  imprimirRed(formData:any, ipserver){
    
    return this.http.post(`http://${ipserver}:3001/print-order`, formData, this.headers);

  }
  
}
