import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

// MODELS
import { Impuesto } from 'src/app/models/impuesto.model';

// SERVICES
import { ImpuestosService } from 'src/app/services/impuestos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-impuestos',
  templateUrl: './impuestos.component.html',
  styles: [
  ]
})
export class ImpuestosComponent implements OnInit {

  

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private impuestosService: ImpuestosService,
                private fb: FormBuilder) { }

  ngOnInit(): void {

    // CARGAR IMPUESTOS
    this.cargarImpuestos();

  }

  /** ================================================================
   *   CARGAR MESAS
  ==================================================================== */
  public listaImpuesto: Impuesto[] = [];
  public listaImpuestoTemp: Impuesto[] = [];
  public totalImpuesto: number = 0;
  cargarImpuestos(){

    this.cargando = true;
    this.sinResultados = true;

    this.impuestosService.loadImpuestos()
        .subscribe(({ total, taxes }) => {

          // COMPROBAR SI EXISTEN RESULTADOS
          if (taxes.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.listaImpuesto = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.totalImpuesto = total;
          this.listaImpuesto = taxes;
          this.listaImpuestoTemp = taxes;
          this.resultado = 0;
          this.cargando = false;

        });
    
  }

  /** ================================================================
   *   CREAR IMPUESTO
  ==================================================================== */
  public formSubmitted:boolean = false;
  public newImpuestoForm = this.fb.group({
    name: ['', [Validators.required]],
    valor: [0, [Validators.required, Validators.min(0)]]
  })

  crearImpuesto(){

    this.formSubmitted = true;
    
    if (this.newImpuestoForm.invalid) {
      return;
    }

    this.impuestosService.createImpuesto(this.newImpuestoForm.value)
        .subscribe( ({tax}) => {

          this.cargarImpuestos();
          Swal.fire('Estupendo', 'Se ha creado el impuesto exitosamente', 'success');

      }, (err) => {
        console.log(err);
        Swal.fire('Error', err.error.msg, 'error');
        
      });


  }

  /** ================================================================
   *   VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.newImpuestoForm.get(campo).invalid &&  this.formSubmitted) {      
      return true;      
    } else{      
      return false;
    }

  }


  // FIN DE LA CLASE
}
