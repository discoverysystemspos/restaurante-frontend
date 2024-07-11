import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

  constructor(  private proveedoresService: ProveedoresService,
                private searchService: SearchService,
                private fb:FormBuilder,
                private invoicesService: InvoiceService) { }

  ngOnInit(): void {

    // CARGAR PROVEEDORES
    this.cargarProveedores();
  }

  /** ================================================================
   *   CARGAR PROVEEDORES
  ==================================================================== */
  public cargando: boolean = true;
  public totalProveedores: number = 0;
  public proveedores: Proveedor[] = [];
  public proveedoresTemp: Proveedor[] = [];
  public bodegas: Proveedor[] = [];
  public query: any = {
    desde: 0,
    hasta: 50
  }

  cargarProveedores(){
    this.cargando = true;
    this.proveedoresService.loadProveedores(this.query)
    .subscribe(({total, proveedores}) => {        
        
      this.proveedores = proveedores;
      this.proveedoresTemp = proveedores;
      this.totalProveedores = total;
      this.cargando = false;
          
      });
  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  @ViewChild('mostrar') mostrar: ElementRef;
  cambiarPagina (valor: number){
    
    this.query.desde += valor;

    if (this.query.desde < 0) {
      this.query.desde = 0;
    }
    
    this.cargarProveedores();
    
  }

  /** ================================================================
   *   CHANGE LIMITE
  ==================================================================== */
  limiteChange( cantidad: any ){  

    this.query.hasta = Number(cantidad);    
    this.cargarProveedores();

  }

  /** ======================================================================
   * SEARCH
  ====================================================================== */
  public resultados: number = 0;
  buscar( termino:string ){

    let query = `desde=${this.query.desde}&hasta=${this.query.hasta}`;

    if (termino.length === 0) {
      this.proveedores = this.proveedoresTemp;
      this.resultados = 0;
      return;
    }
    
    this.searchService.search('proveedores', termino, false, query)
        .subscribe( ({resultados}) => {

          this.proveedores = resultados;

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
          this.cargarProveedores();

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

  /** ================================================================
   *   SELECT PROVEEDOR
  ==================================================================== */
  public proveedorS: string;
  selectedProovedor( proveedor: Proveedor ){

    this.proveedorS = proveedor.provid;

    this.updateForm.setValue({
      name: proveedor.name,
      cedula: proveedor.cedula,
      phone: proveedor.phone,
      email: proveedor.email,
      address: proveedor.address,
      city: proveedor.city,
      department: proveedor.department,
      zip: proveedor.zip,
    })

  }

  /** ================================================================
   *   UPDATE PROVEEDOR
  ==================================================================== */
  public updateFormSubmitted: boolean = true;
  public updateForm = this.fb.group({
    name: ['', Validators.required],
    cedula: ['', Validators.required],
    phone: '',
    email: '',
    address: '',
    city: '',
    department: '',
    zip: '',
  })

  update(){

    this.updateFormSubmitted = true;

    if (this.updateForm.invalid) {
      return;
    }

    this.proveedoresService.updateProveedor(this.updateForm.value, this.proveedorS )
        .subscribe( ({ proveedor }) => {          

          this.proveedores.map( (prov) => {
            if (prov.provid === proveedor.provid) {
              prov.name = proveedor.name;
              prov.cedula = proveedor.cedula;
              prov.phone = proveedor.phone;
              prov.email = proveedor.email;
              prov.address = proveedor.address;
              prov.city = proveedor.city;
              prov.department = proveedor.department;
              prov.zip = proveedor.zip;
            }
          });

          Swal.fire('Estupendo', 'Se ha actualizado el proveedor exitosamente', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   VALIDATOR UPDATE
  ==================================================================== */
  validateUp(campo: string): boolean{

    if (this.updateForm.get(campo).invalid && this.updateFormSubmitted ) {
      return true;      
    }else{
      return false;
    }

  }


  // FIN DE LA CLASE

}
