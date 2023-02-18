import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

// SERVICES
import { EmpresaService } from '../../../services/empresa.service';
import { FileUploadService } from '../../../services/file-upload.service';

// MODELS
import { Datos, comisiones } from '../../../models/empresa.model';
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
  public comisiones: comisiones[] = [];
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {

          this.empresa = datos;

          this.comisiones = datos.comisiones || [];
          
          const { tax, name, address, phone, nit, eid, impuesto, printpos, responsable, impuestoconsumo, resolucion, prefijopos, commission, comision, tip, propina, bascula, comandas, commissions, comisiones, fruver, moneda, decimal, usd,  currencyusd, cop, currencycop, basculaimp, basculatype, basculacode } = datos;

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


}
