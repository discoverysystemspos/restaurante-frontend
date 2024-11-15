import { NgModule, CUSTOM_ELEMENTS_SCHEMA   } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxPrinterModule, ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// MODULES
import { RouterModule } from '@angular/router';
import { PipesModule } from '../pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CalendarModule, DateAdapter  } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';


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
import { CategoriasComponent } from './productos/categorias/categorias.component';
import { CalendarioComponent } from './calendario/calendario.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidoComponent } from './pedido/pedido.component';
import { ComandaComponent } from './comanda/comanda.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { KardexComponent } from './productos/kardex/kardex.component';
import { EntradasSalidasComponent } from './configuracion/entradas-salidas/entradas-salidas.component';
import { ImpuestosComponent } from './configuracion/impuestos/impuestos.component';
import { BancosComponent } from './configuracion/bancos/bancos.component';
import { EliminadosComponent } from './productos/eliminados/eliminados.component';
import { PrestamosComponent } from './configuracion/prestamos/prestamos.component';
import { PrestamoComponent } from './configuracion/prestamos/prestamo/prestamo.component';
import { AlquileresComponent } from './alquileres/alquileres.component';
import { AlquilerComponent } from './alquiler/alquiler.component';
import { ParqueaderoComponent } from './configuracion/parqueadero/parqueadero.component';
import { NgxBarcodeModule } from 'ngx-barcode';
import { ReportesComponent } from './configuracion/parqueadero/reportes/reportes.component';
import { DomiciliosComponent } from './domicilios/domicilios.component';
import { AgmCoreModule } from '@agm/core';
import { BodegasComponent } from './configuracion/bodegas/bodegas.component';
import { BodegaComponent } from './configuracion/bodega/bodega.component';
import { CompraComponent } from './compra/compra.component';
import { QRCodeModule } from 'angularx-qrcode';
import { VehiculosComponent } from './vehiculos/vehiculos.component';
import { PisosComponent } from './configuracion/mesas/pisos/pisos.component';



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
    TotalComponent,
    CreditoComponent,
    FacturaComponent,
    MesasComponent,
    MesaComponent,
    EmpresaComponent,
    CorteComponent,
    CierresComponent,
    PrintComponent,
    MovimientosComponent,
    CategoriasComponent,
    CalendarioComponent,
    PedidosComponent,
    PedidoComponent,
    ComandaComponent,
    ProveedoresComponent,
    KardexComponent,
    EntradasSalidasComponent,
    ImpuestosComponent,
    BancosComponent,
    EliminadosComponent,
    PrestamosComponent,
    PrestamoComponent,
    AlquileresComponent,
    AlquilerComponent,
    ParqueaderoComponent,
    ReportesComponent,
    DomiciliosComponent,
    BodegasComponent,
    BodegaComponent,
    CompraComponent,
    VehiculosComponent,
    PisosComponent
  ],
  exports: [
    PagesComponent,
    DashboardComponent,
    VentasComponent,
    ClientesComponent,
    ImpuestosComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    NgxPrinterModule.forRoot({printOpenWindow: true}),
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    NgxBarcodeModule,
    QRCodeModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAn1G1jlkmzrY2pA1_Rd2-fsJ3Csp9dBDM'
    })
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule { }
