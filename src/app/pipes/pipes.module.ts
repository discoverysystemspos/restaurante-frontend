import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagenPipe } from '../pipes/imagen.pipe';
import { SplitPipe } from './split.pipe';



@NgModule({
  declarations: [ ImagenPipe, SplitPipe ],
  exports: [ 
    ImagenPipe, 
    SplitPipe 
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
