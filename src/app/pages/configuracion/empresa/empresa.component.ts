import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

// SERVICES
import { EmpresaService } from '../../../services/empresa.service';
import { FileUploadService } from '../../../services/file-upload.service';

// MODELS
import { Datos, comisiones } from '../../../models/empresa.model';
import Swal from 'sweetalert2';
import { DataicoService } from 'src/app/services/dataico.service';
import { DataicoInterface } from 'src/app/interfaces/dataico.interface';
import { HttpClient } from '@angular/common/http';

interface _Department {
  codigo: string,
  departamento: string,
}

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
                private fileUploadService: FileUploadService,
                private dataicoService: DataicoService,
                private http: HttpClient) { }

  ngOnInit(): void {

    this.cargarDatos();

    // CARGA DATA DATAICO
    this.loadDataDataico();

    this.loadDepartmentAndCitys();
  }

  /** ================================================================
  *   CARGAR DATOS DE LA EMPRESA
  ==================================================================== */
  public comisiones: comisiones[] = [];
  public ticketHeader: any;
  public ticketfooter: any;
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {

          this.empresa = datos;

          this.ticketHeader =  this.empresa.header.split('\n');
          this.ticketfooter =  this.empresa.footer.split('\n');         
          
          this.comisiones = datos.comisiones || [];
          
          const { tax, name, address, phone, nit, eid, impuesto, printpos, responsable, noresponsable, impuestoconsumo, resolucion, prefijopos, commission, comision, tip, propina, bascula, comandas, commissions, comisiones, fruver, moneda, decimal, usd,  currencyusd, cop, currencycop, basculaimp, basculatype, basculacode, electronica, min, alquileres, impresora, parqueadero, bs, currencybs, datafon, comidatafon } = datos;

          let tipoImpuesto = '';

          if(responsable === true && impuestoconsumo === false && noresponsable === false && impuesto === true){
            tipoImpuesto = 'responsable';
          }else if(responsable === false && impuestoconsumo === true && noresponsable === false && impuesto === true) {
            tipoImpuesto = 'consumo';
          }else if(responsable === false && impuestoconsumo === false && noresponsable === true && impuesto === true) {
            tipoImpuesto = 'noresponsable';
          }

          this.formUpdate.reset(
            { 
              tax, 
              name, 
              address, 
              phone, 
              nit, 
              eid, 
              impuesto, 
              printpos, 
              responsable, 
              impuestoconsumo, 
              resolucion, 
              prefijopos, 
              commission, 
              comision, 
              tip, 
              propina, 
              bascula, 
              comandas, 
              commissions, 
              comisiones, 
              fruver, 
              tipoImpuesto, 
              moneda: moneda || 'COP', 
              decimal: decimal || false, 
              usd: usd || false,  
              currencyusd: currencyusd || 0, 
              cop: cop || false, 
              bs: bs || false, 
              currencybs: currencybs || 0,
              currencycop: currencycop || 0,
              basculaimp: basculaimp || false,
              basculatype: basculatype ||'precio',
              basculacode: basculacode ||'2000',
              electronica: electronica || false,
              min,
              alquileres,
              parqueadero,
              impresora,
              datafon,
              comidatafon

            });

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
    noresponsable: [false],
    impuestoconsumo: [false],
    resolucion: [false],
    prefijopos: [''],
    tip: [false],
    propina: [0],
    commission: [false],
    comision: [0],
    bascula: false,
    fruver: false,
    comandas: false,
    commissions: false,
    comisiones: [],
    tipoImpuesto: [''],
    moneda: ['COP', [Validators.required]],
    decimal: false,
    usd: false,
    currencyusd: 0,
    cop: false,
    bs: false,
    currencycop: 0,
    currencybs: 0,
    basculaimp: false,
    basculatype: 'precio',
    basculacode: '2000',
    electronica: false,
    min: 212000,
    alquileres: false,
    parqueadero: false,
    impresora: 58,
    datafon: false,
    comidatafon: 0
  })

  actualizarDatos(){

    this.formSubmitted = true;

    if (this.formUpdate.invalid) {
      return;
    }

    if(this.formUpdate.value.tipoImpuesto === 'responsable'){
      this.formUpdate.value.responsable = true;
      this.formUpdate.value.impuestoconsumo = false;
      this.formUpdate.value.noresponsable = false;
    }else if(this.formUpdate.value.tipoImpuesto === 'consumo'){
      this.formUpdate.value.responsable = false;
      this.formUpdate.value.impuestoconsumo = true;
      this.formUpdate.value.noresponsable = false;
    }else if(this.formUpdate.value.tipoImpuesto === 'noresponsable'){
      this.formUpdate.value.responsable = false;
      this.formUpdate.value.impuestoconsumo = false;
      this.formUpdate.value.noresponsable = true;
    }else {
      this.formUpdate.value.responsable = false;
      this.formUpdate.value.noresponsable = false;
      this.formUpdate.value.impuestoconsumo = false;
    }

    if (!this.formUpdate.value.impuesto) {
      this.formUpdate.value.responsable = false;
      this.formUpdate.value.impuestoconsumo = false;
    }

    if (this.formUpdate.value.moneda === 'COP') {
      this.formUpdate.value.cop = false; 
      this.formUpdate.value.currencycop = 0; 
    }

    if (this.formUpdate.value.moneda === 'USD') {
      this.formUpdate.value.usd = false; 
      this.formUpdate.value.currencyusd = 0; 
    }

    this.empresaService.updateDatos(this.formUpdate.value, this.empresa.eid)
          .subscribe( (resp: {ok: boolean, datos: Datos}) =>{
            
            this.formSubmitted = false;
            this.formUpdate.reset();
            this.cargarDatos();
            
            Swal.fire('Estupendo', 'La empresa a sido actualizada', 'success');
            

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

  /** ================================================================
   *  AGREGAR COMISION
  ==================================================================== */
  agregarComision(monto: number, comision: number){

    const validarComision = this.comisiones.findIndex( (resp) =>{      
      if (resp.comision === comision ) {

        Swal.fire('Error', 'Ya agregaste este porcentaje de comisión', 'error');
        return true;
      }else {

        if (resp.monto === monto) {          
          Swal.fire('Error', 'Ya agregaste este monto de comisión', 'error');
          return true;
        }

        return false;
      }
    });

    if (validarComision === -1) {
      
      this.comisiones.push({
        activo: true,
        monto,
        comision
      });
      
      this.formUpdate.value.comisiones = this.comisiones;

    }


  }
  
  /** ================================================================
   *  BORRAR COMISION
  ==================================================================== */
  borrarComision(i: any){

    this.comisiones.splice(i,1);
    this.formUpdate.value.comisiones = this.comisiones;
  }

  /** ================================================================
   *  OBTENER DATOS DE LA FACTURA ELECTRONICA
  ==================================================================== */
  public dataDataico: boolean = false;
  public dataico: DataicoInterface;
  loadDataDataico(){

    this.dataicoService.loadDataDataico()
        .subscribe(async ({dataico}) => {

          if (dataico) {
            this.dataDataico = true;
            this.dataico = dataico;
            await this.searchCities(this.dataico.department);
            this.updateFormDataico();
          }          

        }, (err) => {
          console.log(err);
          
        });

  }

  /** ================================================================
   *  CREAR LOS DATOS DE DATAICO
  ==================================================================== */
  public dataicoFormSubmitted: boolean = false;
  public dataicoForm = this.fb.group({
    authtoken: ['', [Validators.required]],
    dataico_account_id: ['', [Validators.required]],    
    invoice_type_code: ['FACTURA_VENTA', [Validators.required]],    
    resolution_number: ['', [Validators.required]],
    prefix: ['', [Validators.required]],
    flexible: [false, [Validators.required]],
    operation: ['ESTANDAR', [Validators.required]],
    env: ['PRUEBAS', [Validators.required]],
    send_dian: [false, [Validators.required]],
    send_email: [false, [Validators.required]],
    desde: [0, [Validators.required]],
    hasta: [0, [Validators.required]],
    department: ['', [Validators.required]],
    city: ['', [Validators.required]],
    email: ['', [Validators.required]],
    phone: ['', [Validators.required]],
  });

  createDataico(){
    this.dataicoFormSubmitted = true;

    if (this.dataicoForm.invalid) {
      return;
    }

    let actions = {
      send_dian: this.dataicoForm.value.send_dian,
      send_email: this.dataicoForm.value.send_email
    }

    let numbering = {
      resolution_number: this.dataicoForm.value.resolution_number,
      prefix: this.dataicoForm.value.prefix,
      flexible: this.dataicoForm.value.flexible
    }

    let dataico = {
      invoice_type_code: this.dataicoForm.value.invoice_type_code,
      actions,
      authtoken: this.dataicoForm.value.authtoken,
      dataico_account_id: this.dataicoForm.value.dataico_account_id,
      numbering,
      env: this.dataicoForm.value.env,
      operation: this.dataicoForm.value.operation,
      desde: this.dataicoForm.value.desde,
      hasta: this.dataicoForm.value.hasta,
      department: this.dataicoForm.value.department,
      city: this.dataicoForm.value.city,
      email: this.dataicoForm.value.email,
      phone: this.dataicoForm.value.phone
      
    }

    this.dataicoService.postDataico(dataico)
        .subscribe( ({dataico}) => {
          
          if (dataico) {
            this.dataDataico = true;
            this.dataico = dataico;
            this.dataicoFormSubmitted = false;
            
            this.updateFormDataico();

          }          

        }, (err) => {
          console.log(err);
          
        });

  }

  /** ================================================================
   *  VALIDAR DATOS DE DATAICO
  ==================================================================== */
  validate(campo: string): boolean{
    if (this.dataicoForm.get(campo).invalid && this.dataicoFormSubmitted) {
      return true;
    }else{
      return false;
    }

  }

  /** ================================================================
   *  ACTUALIZAR FORMULARIO DE ACTUALIZAR
  ==================================================================== */
  updateFormDataico(){

    this.dataicoUpdateForm.setValue({
      authtoken: this.dataico.authtoken,
      dataico_account_id: this.dataico.dataico_account_id,
      invoice_type_code: this.dataico.invoice_type_code,
      resolution_number: this.dataico.numbering.resolution_number,
      prefix: this.dataico.numbering.prefix,
      flexible: this.dataico.numbering.flexible,
      operation: this.dataico.operation,
      env: this.dataico.env,
      send_dian: this.dataico.actions.send_dian,
      send_email: this.dataico.actions.send_email,
      desde: this.dataico.desde || 0,
      hasta: this.dataico.hasta || 0,
      department: this.dataico.department || '',
      city: this.dataico.city || '',
      email: this.dataico.email || '',
      phone: this.dataico.phone || '',
    });    
    
  }

  /** ================================================================
   *  ACTUALIZAR DATOS DE DATAICO
  ==================================================================== */
  public dataicoUpdateFormSubmitted: boolean = false;
  public dataicoUpdateForm = this.fb.group({
    authtoken: ['', [Validators.required]],
    dataico_account_id: ['', [Validators.required]],    
    invoice_type_code: ['FACTURA_VENTA', [Validators.required]],    
    resolution_number: ['', [Validators.required]],
    prefix: ['', [Validators.required]],
    flexible: [false, [Validators.required]],
    operation: ['ESTANDAR', [Validators.required]],
    env: ['PRODUCCION', [Validators.required]],
    send_dian: [false, [Validators.required]],
    send_email: [false, [Validators.required]],
    desde: [0, [Validators.required]],
    hasta: [0, [Validators.required]],
    department: ['', [Validators.required]],
    city: ['', [Validators.required]],
    email: ['', [Validators.required]],
    phone: ['', [Validators.required]],
  });

  updateDataico(){

    this.dataicoUpdateFormSubmitted = true;

    if (this.dataicoUpdateForm.invalid) {
      return;
    }

    let actions = {
      send_dian: this.dataicoUpdateForm.value.send_dian,
      send_email: this.dataicoUpdateForm.value.send_email
    }

    let numbering = {
      resolution_number: this.dataicoUpdateForm.value.resolution_number,
      prefix: this.dataicoUpdateForm.value.prefix,
      flexible: this.dataicoUpdateForm.value.flexible
    }

    let dataico = {
      invoice_type_code: this.dataicoUpdateForm.value.invoice_type_code,
      actions,
      authtoken: this.dataicoUpdateForm.value.authtoken,
      dataico_account_id: this.dataicoUpdateForm.value.dataico_account_id,
      numbering,
      env: this.dataicoUpdateForm.value.env,
      operation: this.dataicoUpdateForm.value.operation,
      desde: this.dataicoUpdateForm.value.desde,
      hasta: this.dataicoUpdateForm.value.hasta,
      department: this.dataicoUpdateForm.value.department,
      city: this.dataicoUpdateForm.value.city,
      email: this.dataicoUpdateForm.value.email,
      phone: this.dataicoUpdateForm.value.phone
    }

    this.dataicoService.updateDataico(dataico, this.dataico.datid)
        .subscribe( ({dataico}) => {

            this.dataDataico = true;
            this.dataico = dataico;
            this.dataicoUpdateFormSubmitted = false;
            this.updateFormDataico();

            Swal.fire('Estupendo', 'Se a actualizado conrrectamente!', 'success');
            
          }, (err) => {
            console.log(err);
            Swal.fire('Error', err.error.msg, 'error');          
        });

  }

  /** ================================================================
   *  VALIDAR DATOS DE DATAICO
  ==================================================================== */
  validateUpdate(campo: string): boolean{
    if (this.dataicoUpdateForm.get(campo).invalid && this.dataicoUpdateFormSubmitted) {
      return true;
    }else{
      return false;
    }

  }

  /** ================================================================
  *   UPDATE HEAR
  ==================================================================== */
  upHeader(header: string){
    this.ticketHeader = header.split('\n');
    this.empresa.header = header;
  }

  /** ================================================================
  *   UPDATE FOOTER
  ==================================================================== */
  upFooter(footer: string){
    this.ticketfooter = footer.split('\n');
    this.empresa.footer = footer;
  }

  /** ================================================================
  *   UPDATE TICKET
  ==================================================================== */
  updateTicket(){

    let data = {
      header: this.empresa.header,
      type: this.empresa.type,
      footer: this.empresa.footer
    }
    

    this.empresaService.updateDatos(data, this.empresa.eid)
        .subscribe( (resp) => {

          console.log(resp);
          Swal.fire('Estupendo', 'Se ha actualizado el ticket exitosamente!', 'success');
          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

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

    this.ListCities = this.cities.filter( city =>  department === city['codigo departamento'] );
    

  }



  // FIN DE LA CLASE
}
