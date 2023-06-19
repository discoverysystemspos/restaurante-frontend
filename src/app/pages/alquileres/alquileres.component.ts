import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-alquileres',
  templateUrl: './alquileres.component.html',
  styles: [
  ]
})
export class AlquileresComponent implements OnInit {

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
