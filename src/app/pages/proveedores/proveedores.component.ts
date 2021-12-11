import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

// MODEL
import { Proveedor } from '../../models/proveedor.model';

// SERVICES
import { SearchService } from '../../services/search.service';
import { InvoiceService } from '../../services/invoice.service';
import { ProveedoresService } from '../../services/proveedores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styles: [
  ]
})
export class ProveedoresComponent implements OnInit {

  public totalProveedores: number = 0;
  public resultado: number = 0;
  public proveedores: Proveedor[] = [];
  public proveedoresTemp: Proveedor[] = [];
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private proveedoresService: ProveedoresService,
                private searchService: SearchService,
                private fb:FormBuilder,
                private invoicesService: InvoiceService) { }

  ngOnInit(): void {

    // CARGAR PROVEEDORES
    this.cargarClientes();
  }

  /** ================================================================
   *   CARGAR CLIENTES
  ==================================================================== */
  cargarClientes(){
    this.cargando = true;
    this.sinResultados = true;
    this.proveedoresService.cargarProveedores(this.desde)
    .subscribe(({total, proveedores}) => {        
        
        // COMPROBAR SI EXISTEN RESULTADOS
        if (proveedores.length === 0) {
          this.sinResultados = false;
          this.proveedores = [];
          this.resultado = 0;
          this.cargando = false;
          return;                
        }
        // COMPROBAR SI EXISTEN RESULTADOS
      
        this.totalProveedores = total;
        this.proveedores = proveedores;
        this.proveedoresTemp = proveedores;
        this.resultado = 0;
        this.cargando = false;

        // BOTONOS DE ADELANTE Y ATRAS          
        if (this.desde === 0 && this.totalProveedores > 10) {
          this.btnAtras = 'disabled';
          this.btnAdelante = '';
        }else if(this.desde === 0 && this.totalProveedores < 11){
          this.btnAtras = 'disabled';
          this.btnAdelante = 'disabled';
        }else if((this.desde + 10) >= this.totalProveedores){
          this.btnAtras = '';
          this.btnAdelante = 'disabled';
        }else{
          this.btnAtras = '';
          this.btnAdelante = '';
        }   
        // BOTONOS DE ADELANTE Y ATRAS
          
      });
  }

  /** ================================================================
   *   CREAR PROVEEDOR
  ==================================================================== */
  // FORMULARIO
  public formSubmitted = false;
  public newProveedorForm = this.fb.group({
    name: [ '' , [Validators.required, Validators.minLength(3)]],
    cedula: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    email: [''],
    address: [''],
    city: [''],
    department: [''],
    zip: ['']
  });

  crearProveedor(){

    this.formSubmitted = true;

    if (this.newProveedorForm.invalid) {
      return;
    }    

    this.proveedoresService.createProveedor(this.newProveedorForm.value)
        .subscribe((resp: any) => {

          Swal.fire('Estupendo', 'Se ha creado el cliente exitosamente!', 'success');
          this.cargarClientes();

          this.formSubmitted = false;
          this.newProveedorForm.reset();          
          
        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });
  }

  // VALIDAR CAMPOS
  campoValido(campo: string): boolean{

    if ( this.newProveedorForm.get(campo).invalid &&  this.formSubmitted) {      
      return true;      
    } else{
            
      return false;
    }
  
  }


  // FIN DE LA CLASE

}
