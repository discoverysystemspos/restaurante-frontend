import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagenPipe } from '../pipes/imagen.pipe';



@NgModule({
  declarations: [ ImagenPipe ],
  exports: [ ImagenPipe ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
