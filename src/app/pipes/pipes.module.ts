import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagenPipe } from '../pipes/imagen.pipe';
import { SplitPipe } from './split.pipe';
import { DivisaPipe } from './divisa.pipe';



@NgModule({
  declarations: [ ImagenPipe, SplitPipe, DivisaPipe ],
  exports: [ 
    ImagenPipe, 
    SplitPipe,
    DivisaPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
