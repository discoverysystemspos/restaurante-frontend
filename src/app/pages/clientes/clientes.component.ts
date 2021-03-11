import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// MODELS
import { Client } from 'src/app/models/client.model';

// SERVICES
import { ClientService } from '../../services/client.service';
import { SearchService } from '../../services/search.service';


@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styles: [
  ]
})
export class ClientesComponent implements OnInit {

  
  
  public totalClientes: number = 0;
  public resultado: number = 0;
  public clientes: Client[] = [];
  public clientesTemp: Client[] = [];
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  
  constructor( private clientService: ClientService,
                private searchService: SearchService,
                private fb:FormBuilder, ) {  }

  ngOnInit(): void {
    
    this.cargarClientes();

  }

  /** ================================================================
   *   CREAR CLIENTES
  ==================================================================== */
  // FORMULARIO
  public formSubmitted = false;
  public newClientForm = this.fb.group({
    name: [ '' , [Validators.required, Validators.minLength(3)]],
    cedula: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email, Validators.minLength(7)]],
    phone: [''],
    address: [''],
    city: [''],
    department: [''],
    zip: ['']
  });

  crearCliente(){

    this.formSubmitted = true;

    if (this.newClientForm.invalid) {
      return;
    }    

    this.clientService.createClient(this.newClientForm.value)
        .subscribe((resp: any) => {

          Swal.fire('Estupendo', 'Se ha creado el cliente exitosamente!', 'success');
          this.cargarClientes();

          this.formSubmitted = false;
          this.newClientForm.reset();          
          
        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });
  }

  // VALIDAR CAMPOS
  campoValido(campo: string): boolean{

    if ( this.newClientForm.get(campo).invalid &&  this.formSubmitted) {      
      return true;      
    } else{
            
      return false;
    }
  
  }

  /** ================================================================
   *   CARGAR CLIENTES
  ==================================================================== */
  cargarClientes(){
    this.cargando = true;
    this.sinResultados = true;
    this.clientService.cargarClientes(this.desde)
    .subscribe(({total, clients}) => {
        
        // COMPROBAR SI EXISTEN RESULTADOS
        if (clients.length === 0) {
          this.sinResultados = false;
          this.clientes = [];
          this.resultado = 0;
          return;                
        }
        // COMPROBAR SI EXISTEN RESULTADOS
      
        this.totalClientes = total;
        this.clientes = clients;
        this.clientesTemp = clients;
        this.resultado = 0;
        this.cargando = false;

        // BOTONOS DE ADELANTE Y ATRAS          
        if (this.desde === 0 && this.totalClientes > 10) {
          this.btnAtras = 'disabled';
          this.btnAdelante = '';
        }else if(this.desde === 0 && this.totalClientes < 11){
          this.btnAtras = 'disabled';
          this.btnAdelante = 'disabled';
        }else if(this.desde > this.clientes.length){
          this.btnAtras = '';
          this.btnAdelante = 'disabled';
        }else if((this.desde + 10) >= this.totalClientes){
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
   *   CAMBIAR PAGINA
  ==================================================================== */
  cambiarPagina (valor: number){
    this.desde += valor;

    if (this.desde < 0) {
      this.desde = 0;
    }else if( this.desde > this.totalClientes ){
      this.desde -= valor;
    }

    this.cargarClientes();

  }

  /** ================================================================
   *   BUSCAR
  ==================================================================== */
  buscar( termino:string ){

    this.sinResultados = true;

    if (termino.length === 0) {
      this.clientes = this.clientesTemp;
      this.resultado = 0;
      return;
    }else{
      this.sinResultados = true;

      this.searchService.search('clients', termino)
            .subscribe(({total, resultados}) => {

              // COMPROBAR SI EXISTEN RESULTADOS
              if (resultados.length === 0) {
                this.sinResultados = false;
                this.clientes = [];
                this.resultado = 0;
                return;                
              }
              // COMPROBAR SI EXISTEN RESULTADOS

              this.totalClientes = total;
              this.clientes = resultados; 
              this.resultado = resultados.length;          
            });
    }    

  }

  /** ================================================================
   *   BORRAR CLIENTE
  ==================================================================== */
  borrarCliente(_id: string){

    this.clientService.deleteClient(_id)
        .subscribe(resp =>{
          Swal.fire('Estupendo', 'Se ha borrado el cliente exitosamente!', 'success');
          this.cargarClientes();
        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });
  }

  /** ================================================================
   *   Actualizar CLIENTE
  ==================================================================== */
  public formSubmittedUp = false;
  public upClientForm = this.fb.group({
    _id: [ '' , [Validators.required, Validators.minLength(24)]],
    name: [ '' , [Validators.required, Validators.minLength(3)]],
    cedula: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email, Validators.minLength(7)]],
    phone: [''],
    address: [''],
    city: [''],
    department: [''],
    zip: ['']
  });

  // OBTENER LA INFORMACION DEL CLIENTE
  actualizarCliente(cliente: Client){

    this.upClientForm.setValue({

      _id: cliente.cid,
      name: cliente.name || '',
      cedula: cliente.cedula || '', 
      email: cliente.email || '',
      phone: cliente.phone || '',
      address: cliente.address || '',
      city: cliente.city || '',
      department: cliente.department || '',
      zip: cliente.zip || ''

    });
    
    
  }
  
  /** ================================================================
   *  ACTUALIZAR CLIENTE
  ==================================================================== */
  updateCLiente(){

    this.formSubmittedUp = true;

    if (this.upClientForm.invalid) {
      return;
    }

    this.clientService.updateClient(this.upClientForm.value, this.upClientForm.value._id)
          .subscribe( resp => {

            Swal.fire('Estupendo', `Se ha actualizado el cliente ${ this.upClientForm.value.name } exitosamente!`, 'success');
            this.cargarClientes();
  
            this.formSubmittedUp = false;
            this.upClientForm.reset();

          }, (err) => {
            Swal.fire('Error', err.error.msg, 'error');
          });
    
    

  }

  /** ================================================================
   *  VALIDAR CAMPOS
  ==================================================================== */
  campoValidoUpdate(campo: string): boolean{

    if ( this.upClientForm.get(campo).invalid &&  this.formSubmittedUp) {      
      return true;      
    } else{
            
      return false;
    }
  
  }
  
  // FIN DE LA CLASE
}
