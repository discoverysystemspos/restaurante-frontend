import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Banco } from 'src/app/models/bancos.model';

// SEVICES
import { BancosService } from 'src/app/services/bancos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.css']
})
export class BancosComponent implements OnInit {

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private bancosService: BancosService,
                private fb: FormBuilder) { }

  ngOnInit(): void {

    // CARGAR BANCOS
    this.cargarBancos();

  }

  /** ================================================================
   *   CARGAR BANCOS
  ==================================================================== */
  public listaBancos: Banco[] = [];
  public listaBancosTemp: Banco[] = [];
  public totalImpuesto: number = 0;
  cargarBancos(){

    this.cargando = true;
    this.sinResultados = true;

    this.bancosService.loadBancos()
        .subscribe(({ total, bancos }) => {

          // COMPROBAR SI EXISTEN RESULTADOS
          if (bancos.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.listaBancos = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.totalImpuesto = total;
          this.listaBancos = bancos;
          this.listaBancosTemp = bancos;
          this.resultado = 0;
          this.cargando = false;

        });
    
  }

  /** ================================================================
   *   CREAR BANCO
  ==================================================================== */
  public formSubmitted:boolean = false;
  public newBancoForm = this.fb.group({
    name: ['', [Validators.required]],
  })

  crearBanco(){

    this.formSubmitted = true;
    
    if (this.newBancoForm.invalid) {
      return;
    }

    this.bancosService.createBanco(this.newBancoForm.value)
        .subscribe( ({banco}) => {

          this.cargarBancos();
          Swal.fire('Estupendo', 'Se ha creado el banco exitosamente', 'success');

      }, (err) => {
        console.log(err);
        Swal.fire('Error', err.error.msg, 'error');
        
      });


  }

  /** ================================================================
   *   VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.newBancoForm.get(campo).invalid &&  this.formSubmitted) {      
      return true;      
    } else{      
      return false;
    }

  }

  /** ================================================================
   *   SELECT BANCO
  ==================================================================== */
  selectBanco(banco: Banco){

    this.bancoSelect = banco;
    this.editBancoForm.setValue({
      name: banco.name
    })

  }

  /** ================================================================
   *   EDITAR BANCO
  ==================================================================== */
  public bancoSelect!: Banco;
  public formSubmittedEdit:boolean = false;
  public editBancoForm = this.fb.group({
    name: ['', [Validators.required]],
  })

  editarBanco(){

    this.formSubmittedEdit = true;
    
    if (this.editBancoForm.invalid) {
      return;
    }

    this.bancosService.updateBanco(this.editBancoForm.value, this.bancoSelect.baid!)
        .subscribe( ({banco}) => {
          
          this.cargarBancos();
          this.formSubmittedEdit = false;
          Swal.fire('Estupendo', 'Se ha actualizado el banco exitosamente', 'success');
          
      }, (err) => {
        console.log(err);
        Swal.fire('Error', err.error.msg, 'error');
        
      });


  }

  /** ================================================================
   *   VALIDAR CAMPOS
  ==================================================================== */
  campoValidoEdit(campo: string): boolean{

    if ( this.editBancoForm.get(campo).invalid && this.formSubmittedEdit) {      
      return true;      
    } else{      
      return false;
    }
    
  }
  
  /** ================================================================
   *   CAMBIAR STATUS
  ==================================================================== */
  statusUpdate(id: string){

    Swal.fire({
      title: 'Atencion',
      text: "Estas seguro de desactivar este banco?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, desactivar ahora',
      cancelButtonText: 'Cancelar'
    }).then((result) => {  

      if (result.isConfirmed) {

        this.bancosService.statusUpdateBanco(id)
            .subscribe( resp => {

              this.cargarBancos();
              Swal.fire('Estupendo', 'Se ha actualizado el banco exitosamente!', 'success');

            }, (err) => {

              console.log(err);
              Swal.fire('Error', err.error.msg, 'error');
              

            });

      }

    });


  }


  // FIN DE LA CLASE
}
