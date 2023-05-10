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
                private dataicoService: DataicoService) { }

  ngOnInit(): void {

    this.cargarDatos();

    // CARGA DATA DATAICO
    this.loadDataDataico();
  }

  /** ================================================================
  *   CARGAR DATOS DE LA EMPRESA
  ==================================================================== */
  public comisiones: comisiones[] = [];
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {

          this.empresa = datos;

          this.comisiones = datos.comisiones || [];
          
          const { tax, name, address, phone, nit, eid, impuesto, printpos, responsable, impuestoconsumo, resolucion, prefijopos, commission, comision, tip, propina, bascula, comandas, commissions, comisiones, fruver, moneda, decimal, usd,  currencyusd, cop, currencycop, basculaimp, basculatype, basculacode, electronica } = datos;

          let tipoImpuesto = '';

          if(responsable === true && impuestoconsumo === false && impuesto === true){
            tipoImpuesto = 'responsable';
          }else if(responsable === false && impuestoconsumo === true && impuesto === true) {
            tipoImpuesto = 'consumo';
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
              currencycop: currencycop || 0,
              basculaimp: basculaimp || false,
              basculatype: basculatype ||'precio',
              basculacode: basculacode ||'2000',
              electronica: electronica || false

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
    currencycop: 0,
    basculaimp: false,
    basculatype: 'precio',
    basculacode: '2000',
    electronica: false
  })

  actualizarDatos(){

    this.formSubmitted = true;

    if (this.formUpdate.invalid) {
      return;
    }

    if(this.formUpdate.value.tipoImpuesto === 'responsable'){
      this.formUpdate.value.responsable = true;
      this.formUpdate.value.impuestoconsumo = false;
    }else if(this.formUpdate.value.tipoImpuesto === 'consumo'){
      this.formUpdate.value.responsable = false;
      this.formUpdate.value.impuestoconsumo = true;
    }else {
      this.formUpdate.value.responsable = false;
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
        .subscribe( ({dataico}) => {

          if (dataico) {
            this.dataDataico = true;
            this.dataico = dataico;
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
    party_type: ['PERSONA_NATURAL', [Validators.required]],
    // SI ES JURIDICO
    company_name: '',    
    // SI ES PERSONA NATURAL
    first_name: '',
    family_name: '',
    party_identification_type: ['NIT', [Validators.required]],
    party_identification: ['', [Validators.required]],
    department: ['', [Validators.required]],
    city: ['', [Validators.required]],
    address_line: ['', [Validators.required]],
    email: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    tax_level_code: ['SIMPLIFICADO', [Validators.required]],
    regimen: ['SIMPLE', [Validators.required]],
    invoice_type_code: ['FACTURA_VENTA', [Validators.required]],    
    resolution_number: ['', [Validators.required]],
    prefix: ['', [Validators.required]],
    flexible: [false, [Validators.required]],
    operation: ['ESTANDAR', [Validators.required]],
    env: ['PRUEBAS', [Validators.required]],
    send_dian: [false, [Validators.required]],
    send_email: [false, [Validators.required]],
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

    let customer = {
      department: this.dataicoForm.value.department,
      address_line: this.dataicoForm.value.address_line,
      party_type: this.dataicoForm.value.party_type,
      city: this.dataicoForm.value.city,
      tax_level_code: this.dataicoForm.value.tax_level_code,
      email: this.dataicoForm.value.email,
      first_name: this.dataicoForm.value.first_name,
      phone: this.dataicoForm.value.phone,
      party_identification_type: this.dataicoForm.value.party_identification_type,
      company_name: this.dataicoForm.value.company_name,
      family_name: this.dataicoForm.value.family_name,
      regimen: this.dataicoForm.value.regimen,
      party_identification: this.dataicoForm.value.party_identification,
    }

    let dataico = {
      invoice_type_code: this.dataicoForm.value.invoice_type_code,
      actions,
      authtoken: this.dataicoForm.value.authtoken,
      dataico_account_id: this.dataicoForm.value.dataico_account_id,
      customer,
      numbering,
      env: this.dataicoForm.value.env,
      operation: this.dataicoForm.value.operation,
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
      party_type: this.dataico.customer.party_type,
      company_name: this.dataico.customer.company_name,
      first_name: this.dataico.customer.first_name,
      family_name: this.dataico.customer.family_name,
      party_identification_type: this.dataico.customer.party_identification_type,
      party_identification: this.dataico.customer.party_identification,
      department: this.dataico.customer.department,
      city: this.dataico.customer.city,
      address_line: this.dataico.customer.address_line,
      email: this.dataico.customer.email,
      phone: this.dataico.customer.phone,
      tax_level_code: this.dataico.customer.tax_level_code,
      regimen: this.dataico.customer.regimen,
      invoice_type_code: this.dataico.invoice_type_code,
      resolution_number: this.dataico.numbering.resolution_number,
      prefix: this.dataico.numbering.prefix,
      flexible: this.dataico.numbering.flexible,
      operation: this.dataico.operation,
      env: this.dataico.env,
      send_dian: this.dataico.actions.send_dian,
      send_email: this.dataico.actions.send_email
    });    

  }

  /** ================================================================
   *  ACTUALIZAR DATOS DE DATAICO
  ==================================================================== */
  public dataicoUpdateFormSubmitted: boolean = false;
  public dataicoUpdateForm = this.fb.group({
    authtoken: ['', [Validators.required]],
    dataico_account_id: ['', [Validators.required]],
    party_type: ['PERSONA_NATURAL', [Validators.required]],
    company_name: '',
    first_name: '',
    family_name: '',
    party_identification_type: ['NIT', [Validators.required]],
    party_identification: ['', [Validators.required]],
    department: ['', [Validators.required]],
    city: ['', [Validators.required]],
    address_line: ['', [Validators.required]],
    email: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    tax_level_code: ['SIMPLIFICADO', [Validators.required]],
    regimen: ['SIMPLE', [Validators.required]],
    invoice_type_code: ['FACTURA_VENTA', [Validators.required]],    
    resolution_number: ['', [Validators.required]],
    prefix: ['', [Validators.required]],
    flexible: [false, [Validators.required]],
    operation: ['ESTANDAR', [Validators.required]],
    env: ['PRUEBAS', [Validators.required]],
    send_dian: [false, [Validators.required]],
    send_email: [false, [Validators.required]],
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

    let customer = {
      department: this.dataicoUpdateForm.value.department,
      address_line: this.dataicoUpdateForm.value.address_line,
      party_type: this.dataicoUpdateForm.value.party_type,
      city: this.dataicoUpdateForm.value.city,
      tax_level_code: this.dataicoUpdateForm.value.tax_level_code,
      email: this.dataicoUpdateForm.value.email,
      first_name: this.dataicoUpdateForm.value.first_name,
      phone: this.dataicoUpdateForm.value.phone,
      party_identification_type: this.dataicoUpdateForm.value.party_identification_type,
      company_name: this.dataicoUpdateForm.value.company_name,
      family_name: this.dataicoUpdateForm.value.family_name,
      regimen: this.dataicoUpdateForm.value.regimen,
      party_identification: this.dataicoUpdateForm.value.party_identification,
    }

    let dataico = {
      invoice_type_code: this.dataicoUpdateForm.value.invoice_type_code,
      actions,
      authtoken: this.dataicoUpdateForm.value.authtoken,
      dataico_account_id: this.dataicoUpdateForm.value.dataico_account_id,
      customer,
      numbering,
      env: this.dataicoUpdateForm.value.env,
      operation: this.dataicoUpdateForm.value.operation,
    }

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



  // FIN DE LA CLASE
}
