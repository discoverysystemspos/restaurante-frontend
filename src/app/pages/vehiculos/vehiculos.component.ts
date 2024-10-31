import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoadInvoice } from 'src/app/interfaces/invoice.interface';
import { Client } from 'src/app/models/client.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Vehiculo } from 'src/app/models/vehiculos.model';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SearchService } from 'src/app/services/search.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.css']
})
export class VehiculosComponent implements OnInit {

  constructor(  private vehiculosService: VehiculosService,
                private searchService: SearchService,
                private fb: FormBuilder,
                private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {

    this.cargarVehiculos();
  }

  /** ================================================================
   *   CARGAR VEHICULOS
  ==================================================================== */
  public cargando: boolean = true;
  public totalVehiculos: number = 0;
  public vehiculos: Vehiculo[] = [];
  public vehiculosTemp: Vehiculo[] = [];
  public query: any = {
    desde: 0,
    hasta: 50
  }

  cargarVehiculos(){
    this.cargando = true;
    this.vehiculosService.loadVehiculos(this.query)
    .subscribe(({total, vehiculos}) => {        
        
      this.vehiculos = vehiculos;
      this.vehiculosTemp = vehiculos;
      this.totalVehiculos = total;
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
    
    this.cargarVehiculos();
    
  }

  /** ================================================================
   *   CHANGE LIMITE
  ==================================================================== */
  limiteChange( cantidad: any ){  

    this.query.hasta = Number(cantidad);    
    this.cargarVehiculos();

  }

  /** ======================================================================
   * SEARCH
  ====================================================================== */
  public resultados: number = 0;
  buscar( termino:string ){

    let query = `desde=${this.query.desde}&hasta=${this.query.hasta}`;

    if (termino.length === 0) {
      this.vehiculos = this.vehiculosTemp;
      this.resultados = 0;
      return;
    }
    
    this.searchService.search('vehiculo', termino, false, query)
        .subscribe( ({resultados}) => {

          this.vehiculos = resultados;

        });   

  }



  /** ======================================================================
   * BUSCAR CLIENTE
  ====================================================================== */
  public listClients: Client[] = [];
  public clientS!: Client;
  buscarClient(termino: string){

    this.listClients = [];
    
    if (termino.length < 1) {
      this.listClients = [];
      return;      
    }

    this.searchService.search('clients', termino)
    .subscribe( ({resultados}) => {      

        this.listClients = resultados;          

      }, (err) => {
        console.log(err);        
      });


  }

  /** ======================================================================
   * CREATE VEHICULO
  ====================================================================== */
  public newFormSubmitted: boolean = false;
  public newForm = this.fb.group({
    client: '',
    placa: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    model: ['', [Validators.required]],
    year: '',
    description: '',
  })

  create(){

    this.newFormSubmitted = true;
    if (this.newForm.invalid) {
      return;
    }

    if (!this.clientS) {
      Swal.fire('Atención', 'No has seleccionado ningun cliente', 'warning');
      return;
    }

    this.newForm.value.client = this.clientS.cid;
    console.log(this.newForm.value);    
    
    this.vehiculosService.createVehiculo(this.newForm.value)
        .subscribe( ({vehiculo}) => {

          vehiculo.vid = vehiculo._id;

          this.vehiculos.push(vehiculo);
          Swal.fire('Estupendo', 'El vehiculo se ha agregado correctamente', 'success');
          this.newForm.reset();
          delete this.clientS;


        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');    
        })
    

  }

  /** ======================================================================
   * VALIDATE INPUTS VEHICULO
  ====================================================================== */
  campoValido(campo: string): boolean{

    if (this.newFormSubmitted && this.newForm.get(campo).invalid) {
      return true;      
    }else{
      return false;
    }

  }

  /** ================================================================
   *   SELECT VEHICULO
  ==================================================================== */
  public vehiculoS: string;
  selectedProovedor( vehiculo: Vehiculo ){

    this.vehiculoS = vehiculo.vid;

    this.updateForm.setValue({
      placa: vehiculo.placa,
      brand: vehiculo.brand,
      model: vehiculo.model,
      year: vehiculo.year,
      description: vehiculo.description
    })

  }

  /** ================================================================
   *   UPDATE PROVEEDOR
  ==================================================================== */
  public updateFormSubmitted: boolean = true;
  public updateForm = this.fb.group({
    placa: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    year: '',
    description: ''
  })

  update(){

    this.updateFormSubmitted = true;

    if (this.updateForm.invalid) {
      return;
    }

    this.vehiculosService.updateVehiculo(this.updateForm.value, this.vehiculoS )
        .subscribe( ({ vehiculo }) => {          

          this.vehiculos.map( (vei) => {
            if (vei.vid === vehiculo.vid) {
              vei.placa = vehiculo.placa;
              vei.brand = vehiculo.brand;
              vei.model = vehiculo.model;
              vei.year = vehiculo.year;
              vei.description = vehiculo.description;
            }
          });

          Swal.fire('Estupendo', 'Se ha actualizado el vehiculo exitosamente', 'success');

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

  

  /** ======================================================================
   * CARGAR FACTURAS DEL VEHICULO VEHICULO
  ====================================================================== */
  public facturas: LoadInvoice[] = [];
  loadFacturas(vehiculo: Vehiculo){

    this.facturas = [];

    this.invoiceService.postQueryInvoice({placa: vehiculo.placa, desde: 0, hasta: 50})
        .subscribe( ({invoices}) => {
          this.facturas = invoices;
        })
  }

}
