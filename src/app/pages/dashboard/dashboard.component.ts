import { Component, OnInit } from '@angular/core';
import { Datos } from '../../models/empresa.model';
import { EmpresaService } from '../../services/empresa.service';

// MODELS
import { Product } from '../../models/product.model';

// SERVICES
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [
  ]
})
export class DashboardComponent implements OnInit {
  
  public empresa: Datos;  
  public desde: number = 0;
  public limite: number = 10;
  

  constructor(  private empresaService: EmpresaService,
                private productService: ProductService) { }

  ngOnInit(): void {

    this.cargarProductosAgotados();
    this.cargarProductosVencidos();
    this.cargarProductosTop();

  }

  /** ================================================================
   *   CARGAR PRODUCTOS AGOTADOS
  ==================================================================== */
  public agotados: Product[] = [];
  public totalAgotados: number = 0;
  public cargandoAgotados: boolean = true;
  public sinResultadosAgotados: boolean = true;
  cargarProductosAgotados(){

    const endPointAgotados = `?desde=${this.desde}&tipo=agotados&valor=true`; 

    this.cargandoAgotados = true;
    this.sinResultadosAgotados = true;
    this.productService.cargarProductos(endPointAgotados)
    .subscribe(({total, products}) => {
            
      // COMPROBAR SI EXISTEN RESULTADOS
      if (products.length === 0) {
        this.sinResultadosAgotados = false;
        this.cargandoAgotados = false;
        this.totalAgotados = products.length;
        this.agotados = [];
        return;                
      }
      // COMPROBAR SI EXISTEN RESULTADOS
    
      this.totalAgotados = products.length;
      this.agotados = products;
      this.cargandoAgotados = false;  
      
        
    });

  }

  /** ================================================================
   *   CARGAR PRODUCTOS AGOTADOS
  ==================================================================== */
  public vencidos: Product[] = [];
  public totalVencidos: number = 0;
  public cargandoVencidos: boolean = true;
  public sinResultadosVencidos: boolean = true;
  cargarProductosVencidos(){

    const endPointAgotados = `?desde=${this.desde}&tipo=vencidos&valor=true`; 

    this.cargandoVencidos = true;
    this.sinResultadosVencidos = true;
    this.productService.cargarProductos(endPointAgotados)
    .subscribe(({total, products}) => {
            
      // COMPROBAR SI EXISTEN RESULTADOS
      if (products.length === 0) {
        this.sinResultadosVencidos = false;
        this.cargandoVencidos = false;
        this.totalVencidos = products.length;
        this.vencidos = [];
        return;                
      }
      // COMPROBAR SI EXISTEN RESULTADOS
    
      this.totalVencidos = products.length;
      this.vencidos = products;
      this.cargandoVencidos = false;  
      
        
    });

  }

  /** ================================================================
   *   CARGAR PRODUCTOS TOP
  ==================================================================== */
  public top: Product[] = [];
  public totalTop: number = 0;
  public cargandoTop: boolean = true;
  public sinResultadosTop: boolean = true;
  cargarProductosTop(){

    const endPointAgotados = `?desde=${this.desde}&tipo=top&valor=true`; 

    this.cargandoTop = true;
    this.sinResultadosTop = true;
    this.productService.cargarProductos(endPointAgotados)
    .subscribe(({total, products}) => {
            
      // COMPROBAR SI EXISTEN RESULTADOS
      if (products.length === 0) {
        this.sinResultadosTop = false;
        this.cargandoTop = false;
        this.totalTop = products.length;
        this.top = [];
        return;                
      }
      // COMPROBAR SI EXISTEN RESULTADOS
    
      this.totalTop = products.length;
      this.top = products;
      this.cargandoTop = false;  
      
        
    });

  }

  // FIN DE LA CLASE
}
