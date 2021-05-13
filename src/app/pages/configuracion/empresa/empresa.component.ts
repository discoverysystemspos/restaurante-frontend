import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

// SERVICES
import { EmpresaService } from '../../../services/empresa.service';
import { FileUploadService } from '../../../services/file-upload.service';

// MODELS
import { Datos } from '../../../models/empresa.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styles: [
  ]
})
export class EmpresaComponent implements OnInit {

  public empresa: Datos;

  constructor(  private empresaService: EmpresaService,
                private fb: FormBuilder,
                private fileUploadService: FileUploadService) { }

  ngOnInit(): void {

    this.cargarDatos();
  }

  /** ================================================================
  *   CARGAR DATOS DE LA EMPRESA
  ==================================================================== */
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {

          this.empresa = datos;
          
          const { tax, name, address, phone, nit, eid, impuesto, printpos, responsable, impuestoconsumo, resolucion, prefijopos, commission, comision, tip, propina, bascula } = datos;

          this.formUpdate.reset({ tax, name, address, phone, nit, eid, impuesto, printpos, responsable, impuestoconsumo, resolucion, prefijopos, commission, comision, tip, propina, bascula });

        });

  }

  /** ================================================================
  *   ACTUALIZAR O CREAR DATOS DE LA EMPRESA
  ==================================================================== */
  public formSubmitted = false;
  public formUpdate = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.minLength(5)]],
    nit: ['', [Validators.required, Validators.minLength(3)]],
    tax: [''],
    eid:['', [Validators.required]],
    impuesto: [''],
    printpos: [true],
    responsable: [false],
    impuestoconsumo: [false],
    resolucion: [''],
    prefijopos: [''],
    tip: [false],
    propina: [0],
    commission: [false],
    comision: [0],
    bascula: false,
  })

  actualizarDatos(){

    this.formSubmitted = true;

    if (this.formUpdate.invalid) {
      return;
    }

    this.empresaService.updateDatos(this.formUpdate.value, this.empresa.eid)
          .subscribe( (resp: {ok: boolean, datos: Datos}) =>{
            
            this.cargarDatos();
            
            Swal.fire('Estupendo', 'La empresa a sido creada', 'success');
            
            this.formSubmitted = false;
            this.formUpdate.reset();

          }, (err) =>{ Swal.fire('Error', err.error.msg, 'error') });

  }

  /** ================================================================
   *  VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.formUpdate.get(campo).invalid &&  this.formSubmitted) {  
      return true;      
    } else{            
      return false;
    }
  
  }

  /** ================================================================
   *   ACTUALIZAR IMAGEN
  ==================================================================== */
  public imgTemp: any = null;
  public subirImagen: File;
  cambiarImage(file: File){
    this.subirImagen = file;
    
    if (!file) { return this.imgTemp = null }

    const reader = new FileReader();
    const url64 = reader.readAsDataURL( file );

    reader.onloadend = () => {
      this.imgTemp = reader.result;
    }

  }
      
  /** ================================================================
   *  SUBIR IMAGEN fileImg
  ==================================================================== */
  @ViewChild('fileImg') fileImg: ElementRef;
  public imgProducto: string = 'no-image';
  subirImg(){
    
    this.fileUploadService.updateImage( this.subirImagen, 'logo', this.empresa.eid)
    .then( img => this.empresa.logo = img);
    
    this.fileImg.nativeElement.value = '';
    this.imgProducto = 'no-image';
    this.imgTemp = null;
    
  }






}
