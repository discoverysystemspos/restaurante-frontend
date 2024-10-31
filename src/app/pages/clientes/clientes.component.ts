import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

// EXCEL
import * as XLSX from 'xlsx';

// MODELS
import { Client } from 'src/app/models/client.model';

// SERVICES
import { ClientService } from '../../services/client.service';
import { SearchService } from '../../services/search.service';
import { InvoiceService } from '../../services/invoice.service';
import { LoadInvoice, ListInvoice, ListCreditoCliente } from '../../interfaces/invoice.interface';
import { BancosService } from 'src/app/services/bancos.service';
import { Banco } from 'src/app/models/bancos.model';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Invoice } from 'src/app/models/invoice.model';
import { TurnoService } from 'src/app/services/turno.service';
import { LoadTurno } from 'src/app/interfaces/load-turno.interface';

interface _Department {
  codigo: string,
  departamento: string,
}

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

  public user: User;
  constructor(  private clientService: ClientService,
                private searchService: SearchService,
                private fb:FormBuilder,
                private invoicesService: InvoiceService,
                private bancosService: BancosService,
                private userService: UserService,
                private turnoService: TurnoService,
                private http: HttpClient) {  
                  this.user = userService.user;
                }

  ngOnInit(): void {
    
    this.cargarClientes();

    this.loadDepartmentAndCitys();

    this.cargarBancos();

    // CARGAR TURNO
    this.cargarTurno();

  }

  /** ================================================================
   *   CARGAR BANCOS
  ==================================================================== */
  public bancos: Banco[] = [];
  cargarBancos(){

    this.bancosService.loadBancos()
        .subscribe( ({bancos}) => {

          this.bancos = bancos.filter( banco => banco.status === true);          

        });

  }

  /** ================================================================
   *  ABONOS A CREDITOS
  ==================================================================== */
  public turno: LoadTurno;
  cargarTurno(){

    this.turnoService.getTurnoId(this.user.turno)
        .subscribe( (turno) => {
          this.turno = turno;                    
        });

  }


  /** ================================================================
   *  ABONOS A CREDITOS
  ==================================================================== */
  @ViewChild ('descripcionAdd') descripcionAdd: ElementRef;
  @ViewChild ('montoAdd') montoAdd: ElementRef;
  agregarPagos(type: string, monto: any, description: string){

    monto = Number(monto);

    if (monto === 0 || monto < 1) {
      Swal.fire('Atención', 'No has agregado un monto', 'info');
      return;      
    }

    if (this.user.cerrada) {
      Swal.fire('Atención', 'Debes de abrir caja primero', 'info');
      return;    
    }

    for (let i = 0; i < this.creditos.length; i++) {
      const factura = this.creditos[i];

      console.log(monto);

      if (monto <= 0) {
        console.log('ES 0');
        return;
      }     

      // SI EL MONTO ES MENOR A LA DEUDA DE LA FACTURA
      if (monto < (factura.amount - factura.totalAbonado)) {

        console.log('Menor');        

        factura.paymentsCredit.push({
          type,
          amount: monto,
          description,
          turno: this.user.turno
        }); 

        monto = 0;
        factura.totalAbonado += factura.paymentsCredit[factura.paymentsCredit.length - 1].amount;
        this.totalAbonado += factura.paymentsCredit[factura.paymentsCredit.length - 1].amount;

        

        // this.invoicesService.updateInvoice( {paymentsCredit: factura.paymentsCredit, credito: factura.credito }, factura.iid )
        //     .subscribe( async ( resp:{ok: boolean, invoice: Invoice } ) => {

        //       this.descripcionAdd.nativeElement.value = '';
        //       this.montoAdd.nativeElement.value = '';
        //       Swal.fire('Estupendo', 'Se ha agregado el pago exitosamente', 'success');

        //       let payTurno = {
        //         factura: factura.iid,
        //         pay: resp.invoice.paymentsCredit[resp.invoice.paymentsCredit.length - 1]._id,
        //         monto: resp.invoice.paymentsCredit[factura.paymentsCredit.length - 1].amount,
        //       }
    
        //       this.turno.abonos.push(payTurno);
              
        //       this.turnoService.updateTurno({abonos:this.turno.abonos}, this.user.turno)
        //       .subscribe( resp => {       
        //         }, (err) => {
        //           console.log(err);              
        //       })

        //     }, (err) => {
        //       console.log(err);
        //       Swal.fire('Error', err.error.msg, 'error');
              
        //     })
        
      }else if (monto >= (factura.amount - factura.totalAbonado)) {

        console.log('MAYOR');

        factura.paymentsCredit.push({
          type,
          amount: (factura.amount - factura.totalAbonado),
          description,
          turno: this.user.turno
        });

        factura.credito = false;

        monto -= factura.paymentsCredit[factura.paymentsCredit.length - 1].amount;

        factura.totalAbonado += factura.paymentsCredit[factura.paymentsCredit.length - 1].amount;
        this.totalAbonado += factura.paymentsCredit[factura.paymentsCredit.length - 1].amount;        
        
      }else{
        console.log('RETORNO');
        return;
      }

      console.log('Agregar pago');

      this.invoicesService.updateInvoice( {paymentsCredit: factura.paymentsCredit, credito: factura.credito }, factura.iid )
            .subscribe( ( resp:{ok: boolean, invoice: Invoice } ) => {

              this.descripcionAdd.nativeElement.value = '';
              this.montoAdd.nativeElement.value = '';
              Swal.fire('Estupendo', 'Se ha agregado el pago exitosamente', 'success');

              let payTurno = {
                factura: resp.invoice.iid,
                pay: resp.invoice.paymentsCredit[resp.invoice.paymentsCredit.length - 1]._id,
                monto: resp.invoice.paymentsCredit[resp.invoice.paymentsCredit.length - 1].amount,
              }
    
              this.turno.abonos.push(payTurno);
              
              this.turnoService.updateTurno({abonos:this.turno.abonos}, this.user.turno)
              .subscribe( resp => {

                }, (err) => {
                  console.log(err);              
              })

            }, (err) => {
              console.log(err);
              Swal.fire('Error', err.error.msg, 'error');
              
            })
      
    }
    
  }


  /** ================================================================
   *  OBTENER DEPARTAMENTOS Y CIUDADES
  ==================================================================== */
  public departments: _Department[] = [];
  public cities: any[] = [];
  loadDepartmentAndCitys(){

    this.http.get('assets/json/departamentos.json')
        .subscribe( (data: any) => {          
          this.departments = data;            
        });

    this.http.get('assets/json/ciudades.json')
    .subscribe( (data: any) => {          
      this.cities = data;          
    })

  }

  /** ================================================================
   *  OBTENER CIUDADES DEPENDIENDO DEL DEPARTAMENTO
  ==================================================================== */
  public ListCities: any[] = [];
  searchCities(department: string){

    this.ListCities = [];

    if (department.length === 0 ) {
      return;
    }

    this.ListCities = this.cities.filter( city =>  department === city.departamento );

  }

  /** ================================================================
   *   CREAR CLIENTES
  ==================================================================== */
  // FORMULARIO
  public formSubmitted = false;
  public newClientForm = this.fb.group({
    party_type: ['PERSONA_NATURAL', [Validators.required]],
    tax_level_code: ['NO_RESPONSABLE_DE_IVA', [Validators.required]],
    party_identification_type: ['CC', [Validators.required]],
    company_name: '',
    first_name: '',
    family_name: '',
    address_line: '',
    regimen: ['SIMPLE',],
    party_identification: '',
    codigodepartamento: '',
    codigociudad: '',
    sendemail: false,
    // OLD
    name: [''],
    cedula: ['', [Validators.required, Validators.minLength(3)]],
    email: [''],
    phone: [''],
    address: [''],
    city: [''],
    department: [''],
    zip: [''],
    mayoreo: false,
    contratista: false,
  });

  async crearCliente(){

    // OBTENER CODIGO DEL DEPARTAMENTO Y CIUDAD
    let ciudaQ = await this.cities.find( city =>  {
      if ( this.newClientForm.value.city === city.ciudad && this.newClientForm.value.department === city.departamento) {
        return city
      }
    });
    
    this.newClientForm.value.codigodepartamento  = ciudaQ['codigo departamento'];
    this.newClientForm.value.codigociudad  = ciudaQ['codigo'];

    this.formSubmitted = true;

    if (this.newClientForm.invalid) {
      return;
    }
    
    if (this.newClientForm.value.party_type === 'PERSONA_NATURAL') {      
      this.newClientForm.value.name = `${this.newClientForm.value.first_name} ${this.newClientForm.value.family_name}`
    }else{
      this.newClientForm.value.name = this.newClientForm.value.company_name;
    }

    this.newClientForm.value.party_identification = this.newClientForm.value.cedula;

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
        .subscribe((resp:{client, ok}) =>{

          if (resp.client.status) {
            Swal.fire('Estupendo', 'Se ha habilitado el cliente exitosamente!', 'success');
          }else{
            Swal.fire('Estupendo', 'Se ha eliminado el cliente exitosamente!', 'success');
          }

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
    party_type: ['PERSONA_NATURAL', [Validators.required]],
    tax_level_code: ['NO_RESPONSABLE_DE_IVA', [Validators.required]],
    party_identification_type: ['CC', [Validators.required]],
    company_name: '',
    first_name: '',
    family_name: '',
    regimen: ['SIMPLE',],
    party_identification: '',
    codigodepartamento: '',
    codigociudad: '',
    // OLD
    _id: [ '' , [Validators.required, Validators.minLength(24)]],
    name: [''],
    cedula: ['', [Validators.required, Validators.minLength(3)]],
    email: [''],
    phone: [''],
    address: [''],
    city: [''],
    department: [''],
    zip: [''],
    credit: false,
    mayoreo: false,
    contratista: false,
  });

  // OBTENER LA INFORMACION DEL CLIENTE
  async actualizarCliente(cliente: Client){

    await this.searchCities(cliente.department);


    this.upClientForm.reset();


    this.upClientForm.setValue({

      party_type: cliente.party_type || 'PERSONA_NATURAL',
      tax_level_code: cliente.tax_level_code || 'NO_RESPONSABLE_DE_IVA',
      party_identification_type: cliente.party_identification_type || 'CC',
      company_name: cliente.company_name || '',
      first_name: cliente.first_name || '',
      family_name: cliente.family_name || '',
      regimen: cliente.regimen || 'SIMPLE',
      party_identification: cliente.party_identification || '',
      codigodepartamento: cliente.codigodepartamento || '',
      codigociudad: cliente.codigociudad || '',
      // OLD
      _id: cliente.cid,
      name: cliente.name || '',
      cedula: cliente.cedula || '', 
      email: cliente.email || '',
      phone: cliente.phone || '',
      address: cliente.address || '',
      city: cliente.city || '',
      department: cliente.department || '',
      zip: cliente.zip || '',
      credit : cliente.credit || false,
      mayoreo : cliente.mayoreo || false,
      contratista : cliente.contratista || false

    });
    
    
  }
  
  /** ================================================================
   *  ACTUALIZAR CLIENTE
  ==================================================================== */
  async updateCLiente(){

    // OBTENER CODIGO DEL DEPARTAMENTO Y CIUDAD
    let ciudaQ = await this.cities.find( city =>  {
      if ( this.upClientForm.value.city === city.ciudad && this.upClientForm.value.department === city.departamento) {
        return city
      }
    });

    this.upClientForm.value.codigodepartamento  = ciudaQ['codigo departamento'];
    this.upClientForm.value.codigociudad  = ciudaQ['codigo'];

    this.formSubmittedUp = true;

    if (this.upClientForm.invalid) {
      return;
    }

    if (this.upClientForm.value.party_type === 'PERSONA_NATURAL') {      
      this.upClientForm.value.name = `${this.upClientForm.value.first_name} ${this.upClientForm.value.family_name}`
    }else{
      this.upClientForm.value.name = this.upClientForm.value.company_name;
    }

    this.upClientForm.value.party_identification = this.upClientForm.value.cedula;
    
    this.clientService.updateClient(this.upClientForm.value, this.upClientForm.value._id)
          .subscribe( resp => {

            Swal.fire('Estupendo', `Se ha actualizado el cliente ${ this.upClientForm.value.name } exitosamente!`, 'success');
            this.cargarClientes();
  
            this.formSubmittedUp = false;

          }, (err) => {
            Swal.fire('Error', err.error.msg, 'error');
          });
    
    

  }

  /** ================================================================
   *  VALIDAR CAMPOScredito
  ==================================================================== */
  campoValidoUpdate(campo: string): boolean{

    if ( this.upClientForm.get(campo).invalid &&  this.formSubmittedUp) {      
      return true;      
    } else{
            
      return false;
    }
  
  }

  /** ================================================================
   *  CARGAR LAS FACTURAS A CREDITO DEL CLIENTE
  ==================================================================== */
  public creditos: LoadInvoice[] = [];
  public clienteCredito: Client;
  public totalAbonado: number = 0;
  public totalCredito: number = 0;
  credito(client: Client, credito: boolean){

    this.creditos = [];
    this.clienteCredito = client;
    this.totalAbonado = 0;
    this.totalCredito = 0;

    this.invoicesService.loadInvoiceCreditClient(client.cid, credito)
        .subscribe( (invoices) => {

          this.creditos = invoices;
          
          for (let i = 0; i < this.creditos.length; i++) {
            const factura = this.creditos[i];

            factura.totalAbonado = 0;

            this.totalCredito += factura.amount;

            for (const pago of factura.payments) {
              this.totalAbonado += pago.amount;
              factura.totalAbonado += pago.amount;
            }

            for (const pago of factura.paymentsCredit) {
              this.totalAbonado += pago.amount;
              factura.totalAbonado += pago.amount;
            }            
            
          }

        });
  }

  /** ================================================================
   *   IMPORTAR EXCEL
  ==================================================================== */
  arrayBuffer:any;
  file:File;
  public totalItems: number = 0;
  public sendExcel: boolean = false;

  public clients: any[] = [];

  incomingfile(event: any){
    this.file= event.target.files[0]; 
  }

  uploadExcel() {

    if (!this.file) {
      Swal.fire('Atención', 'No has seleccionado ningun archivo de excel', 'info');
      return;
    }

    this.sendExcel = true;


    let fileReader = new FileReader();
      fileReader.onload = (e) => {

          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();

          for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, {type:"binary"});
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          
          const clientsArr: any[] = XLSX.utils.sheet_to_json(worksheet,{raw:true});

          for (const client of clientsArr) {

            if (client.party_type === 'PERSONA_NATURAL') {
              client.name = `${client.nombre} ${client.apellido}`;
              client.first_name = client.nombre;
              client.family_name = client.apellido;
            }else if (client.party_type === 'PERSONA_JURIDICA') {
              client.company_name = client.nombre;
              client.name = client.nombre;
            }

            this.http.get('assets/json/ciudades.json')
            .subscribe( (data: any) => {          
              this.cities = data;          
            })

            let data = this.cities.find( city => client.city === city.ciudad)

            client.department = data.departamento;
            client.codigodepartamento = data['codigo departamento'];
            client.codigociudad = data.codigo;

            this.clients.push(client);

          }
          
          this.clientService.createClientExcel({clients: this.clients})
              .subscribe( ({total}) => {

                Swal.fire('Estupendo', `Se guardaron ${total} clientes exitosamente!`, 'success');                
                this.sendExcel = false;
                location.reload();

              }, (err) => {
                this.sendExcel = false;
                console.log(err);
                Swal.fire('Error', err.error.msg, 'error');                
              })

      }
      
      fileReader.readAsArrayBuffer(this.file);
  };

  /** ================================================================
   *   PLANTILLA
  ==================================================================== */
  plantilla(){

    let products = [{
      nombre: 'Pedro',
      apellido: 'Perez',
      party_type: 'PERSONA_NATURAL',
      tax_level_code: 'NO_RESPONSABLE_DE_IVA',
      party_identification_type: 'CC',
      cedula: '1111111',
      city: 'BUCARAMANGA',
      address: 'calle 22 #35',
      phone: '22222222',
      email: 'pedro@gmail.com',
      },
      {
        nombre: 'drogueria aaa',
        apellido: '',
        party_type: 'PERSONA_JURIDICA',
        tax_level_code: 'NO_RESPONSABLE_DE_IVA',
        party_identification_type: 'NIT',
        cedula: '3333333333',
        city: 'CUCUTA',
        address: 'el bosque',
        phone: '4444444444',
        email: 'drogueria@gmail.com',
      }
    ];

    /* generate a worksheet */
    var ws = XLSX.utils.json_to_sheet(products);

    /* add to workbook */
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");

    /* title */
    let title = 'clientes.xls';

    /* write workbook and force a download */
    XLSX.writeFile(wb, title);

  }

  /** ================================================================
   *   EXPORT EXCEL
  ==================================================================== */
  exportExcel(){

    let query = {
      desde: 0,
      hasta: 1000000,
    }

    this.clientService.loadClientsQuery(query)
        .subscribe( ({clients }) => {

          /* generate a worksheet */
          var ws = XLSX.utils.json_to_sheet(clients);
      
          /* add to workbook */
          var wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Clientes");
      
          /* title */
          let title = 'clients.xls';
      
          /* write workbook and force a download */
          XLSX.writeFile(wb, title);
          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }
  
  // FIN DE LA CLASE
}
