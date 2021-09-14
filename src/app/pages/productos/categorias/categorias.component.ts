import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// MODELS
import { Categoria } from '../../../models/categoria.model';

// SERVICES
import { CategoriaService } from '../../../services/categoria.service';
import { SearchService } from '../../../services/search.service';
import { FileUploadService } from '../../../services/file-upload.service';
import { Department } from 'src/app/models/department.model';
import { ListDepartamento } from '../../../models/department.model';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styles: [
  ]
})
export class CategoriasComponent implements OnInit {

  public categorias: Categoria[] = [];
  public categoriasTemp: Categoria[] = [];
  public totalCategorias: number = 0;
  
  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  // IMAGEN
  public subirImagen: File;

  constructor(  private categoriaService: CategoriaService,
                private searchService: SearchService,
                private fb: FormBuilder,
                private fileUploadService: FileUploadService) { }

  ngOnInit(): void {
    
    this.cargarCategorias();

  }

  /** ================================================================
   *   CARGAR CATEGORIAS
  ==================================================================== */
  cargarCategorias(){
    this.cargando = true;
    this.sinResultados = true;

    this.categoriaService.loadDepartment()
        .subscribe(({ total, categorias }) =>{          

          this.totalCategorias = total;
          this.categorias = categorias;
          this.categoriasTemp = categorias;
          this.resultado = 0;
          this.cargando = false;

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); }
        )
  }

  /** ================================================================
   *   BUSCAR CATEGORIA
  ==================================================================== */
  buscar(termino:string){
    
    this.sinResultados = true;
    if (termino.length === 0) {
      this.categorias = this.categoriasTemp;
      this.resultado = 0;
      return;
    }else{
      
      this.sinResultados = true;
      
      this.searchService.search('categorias', termino)
          .subscribe(({total, resultados}) => {
            
            // COMPROBAR SI EXISTEN RESULTADOS
            if (resultados.length === 0) {
              this.sinResultados = false;
              this.categorias = [];
              this.resultado = 0;
              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS
            
            this.totalCategorias = total;
            this.categorias = resultados; 
            this.resultado = resultados.length;  

          }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

    }

  }

  /** ================================================================
   *   BUSCAR DEPARTAMENTOS
  ==================================================================== */
  public departamentos: Department[] = [];
  public sinResultados2:boolean = true;
  public cargando2:boolean = false;
  buscarDepartamento(termino:string){

    this.cargando2 = true;
    
    this.sinResultados2 = true;
    if (termino.length === 0) {
      this.departamentos = [];
      this.cargando2 = false;
      return;
    }else{
      
      this.sinResultados2 = true;
      
      this.searchService.search('departments', termino)
      .subscribe(({total, resultados}) => {
        
            this.cargando2 = false;
            // COMPROBAR SI EXISTEN RESULTADOS
            if (resultados.length === 0) {
              this.sinResultados2 = false;
              this.departamentos = [];
              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS
            this.departamentos = resultados; 

          }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

    }

  }

  /** ================================================================
   *   SELECCIONAR DEPARTAMENTO
  ==================================================================== */
  public listDepartamento: ListDepartamento[] = [];
  public listadoDepartamento: any[] = [];
  @ViewChild('searchDepartamento') searchDepartamento: ElementRef;
  seleccionarDepartamento(departamentoID: string, departamentoName: string){

    const validarItem = this.listDepartamento.findIndex( (resp) =>{      
      if (resp.department === departamentoID ) {
        return true;
      }else {
        return false;
      }
    });

    if ( validarItem === -1 ) {

      this.listDepartamento.push({
        department: departamentoID
      });

      this.listadoDepartamento.push({
        name: departamentoName,
        did : departamentoID
      });

      this.searchDepartamento.nativeElement.value = '';
      this.searchDepartamento.nativeElement.focus();
      this.departamentos = [];
      
    }else{
      this.searchDepartamento.nativeElement.value = '';
      this.searchDepartamento.nativeElement.focus();
      this.departamentos = [];

      Swal.fire('Atención', 'Ya existe este departamento en esta categoria', 'warning');
      return;

    }


  }

  /** ================================================================
   *   ELIMINAR DEPARTAMENTO DE LA CATEGORIA
  ==================================================================== */
  eliminarProductoCarrito( i: number ){

    this.listDepartamento.splice(i, 1);
    this.listadoDepartamento.splice(i, 1);
  }

  /** ================================================================
   *   CREAR CATEGORIA
  ==================================================================== */
  public newCategoriaForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    visibility: [true, [Validators.required]]
  });
  public formSubmitted = false;

  crearCategoria(){
    
    this.formSubmitted = true;

    if (this.newCategoriaForm.invalid) {
      return;
    }
   
    this.categoriaService.createDepartment(this.newCategoriaForm.value)
        .subscribe( resp => {

          this.cargarCategorias();          
          Swal.fire('Estupendo', `Se ha creado la categoria ${this.newCategoriaForm.value.name}, exitosamente!`, 'success')
          this.newCategoriaForm.reset();
          this.formSubmitted = false;
        
        }, (err) => { Swal.fire('Error', err.error.msgm, 'error'); })    


  }

  /** ================================================================
   *  VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.newCategoriaForm.get(campo).invalid &&  this.formSubmitted) {  
      return true;      
    } else{            
      return false;
    }
  
  }

  /** ================================================================
   *  OBTENER INFORMACIÓN DEL DEPARTAMENTO PARA ACTUALIZAR
  ==================================================================== */
  public upCategoriaForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    id: ['', [Validators.required, Validators.minLength(3)]],
    department: [''],
    visibility: [true, [Validators.required]]
  })

  public imgCategoria: string = 'no-image';

  informacionCategoria(categoria: Categoria){

    this.listDepartamento = [];
    this.listadoDepartamento = [];

    this.imgCategoria = categoria.img || 'no-image';

    // CARGAR DEPARTAMENTOS

    
    if( categoria.department){
      
      let depart = categoria.department;
      
      if (depart.length > 0) {

        for (let i = 0; i < depart.length; i++) {          

          this.seleccionarDepartamento(depart[i].department._id, depart[i].department.name);

        }

      }else{
        this.listDepartamento = [];
        this.listadoDepartamento = [];
      }     
      
    }else{
      this.listDepartamento = [];
      this.listadoDepartamento = [];
    }
    // CARGAR DEPARTAMENTOS

    this.upCategoriaForm.setValue({
      name: categoria.name,
      id: categoria.catid,
      department: this.listDepartamento,
      visibility: categoria.visibility || true
    });

  }


  /** ================================================================
   *  ACTUALIZAR CATEGORIA
  ==================================================================== */
  public formSubmittedUp = false;
  actualizarCategoria(){

    this.formSubmittedUp = true;
    
    if (this.upCategoriaForm.invalid) {
      return;
    }

    this.upCategoriaForm.value.department = this.listDepartamento;
    
    this.categoriaService.updateDepartment(this.upCategoriaForm.value, this.upCategoriaForm.value.id)
        .subscribe( resp => {
          
          this.cargarCategorias();
          Swal.fire('Estupendo', `La Categoria ${this.upCategoriaForm.value.name}, ha sido actualizado`, 'success');
          this.upCategoriaForm.reset();
          this.formSubmittedUp = false;

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *  VALIDAR CAMPOS
  ==================================================================== */
  campoValidoUpdate(campo: string): boolean{
    
    if ( this.upCategoriaForm.get(campo).invalid &&  this.formSubmittedUp) {      
      return true;      
    } else{
      
      return false;
    }
  
  }
    
  /** ================================================================
   *  ACTUALIZAR STATUS DEL DEPARTAMENTO
  ==================================================================== */
  statusUpdate(id:string){
    
    this.categoriaService.statusUpdateDepartment(id)
        .subscribe( (department) => {

          let information: string;
          if (department.status) {
            information = 'Activado';            
          }else{
            information = 'Desactivado';
          }
          
          
          this.cargarCategorias();
          Swal.fire('Estupendo', `La Categoria ${department.name}, ha sido ${information}`, 'success');

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *  SELECCIONAR IMAGEN
  ==================================================================== */
  public imgTemp: any = null;
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
  subirImg(){

    this.fileUploadService.updateImage( this.subirImagen, 'categoria', this.upCategoriaForm.value.id)
        .then( img => this.cargarCategorias());

    this.fileImg.nativeElement.value = '';
    this.imgCategoria = 'no-image';
    this.imgTemp = null;
    
  }

}
