import { NgModule, CUSTOM_ELEMENTS_SCHEMA   } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxPrinterModule, ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// MODULES
import { RouterModule } from '@angular/router';
import { PipesModule } from '../pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';


// COMPONENTS
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VentasComponent } from './ventas/ventas.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ProductosComponent } from './productos/productos.component';
import { InventarioComponent } from './inventario/inventario.component';
import { ComprasComponent } from './compras/compras.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { FacturasComponent } from './facturas/facturas.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ProductoComponent } from './productos/producto.component';
import { NuevoComponent } from './productos/nuevo/nuevo.component';
import { DepartamentosComponent } from './productos/departamentos/departamentos.component';
import { TicketComponent } from './ventas/ticket/ticket.component';
import { CajaComponent } from './configuracion/caja/caja.component';
import { UsuariosComponent } from './configuracion/usuarios/usuarios.component';
import { AperturaComponent } from './dashboard/apertura/apertura.component';
import { TotalComponent } from './facturas/total/total.component';
import { CreditoComponent } from './facturas/credito/credito.component';
import { FacturaComponent } from './facturas/factura/factura.component';
import { MesasComponent } from './configuracion/mesas/mesas.component';
import { MesaComponent } from './ventas/mesa/mesa.component';
import { EmpresaComponent } from './configuracion/empresa/empresa.component';
import { CorteComponent } from './corte/corte.component';
import { CierresComponent } from './configuracion/cierres/cierres.component';
import { PrintComponent } from './ventas/print/print.component';
import { MovimientosComponent } from './productos/movimientos/movimientos.component';


@NgModule({
  declarations: [
    PagesComponent,
    DashboardComponent,
    VentasComponent,
    ClientesComponent,
    ProductosComponent,
    InventarioComponent,
    ComprasComponent,
    ConfiguracionComponent,
    FacturasComponent,
    PerfilComponent,
    ProductoComponent,
    NuevoComponent,
    DepartamentosComponent,
    TicketComponent,
    CajaComponent,
    UsuariosComponent,
    AperturaComponent,
    TotalComponent,
    CreditoComponent,
    FacturaComponent,
    MesasComponent,
    MesaComponent,
    EmpresaComponent,
    CorteComponent,
    CierresComponent,
    PrintComponent,
    MovimientosComponent
  ],
  exports: [
    PagesComponent,
    DashboardComponent,
    VentasComponent,
    ClientesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    NgxPrinterModule.forRoot({printOpenWindow: true})
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule { }
