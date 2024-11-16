import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// GUARD
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { WaiterGuard } from '../guards/waiter.guard';

// COMPONENTS
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientesComponent } from './clientes/clientes.component';
import { VentasComponent } from './ventas/ventas.component';
import { ProductosComponent } from './productos/productos.component';
import { InventarioComponent } from './inventario/inventario.component';
import { ComprasComponent } from './compras/compras.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { FacturasComponent } from './facturas/facturas.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ProductoComponent } from './productos/producto.component';
import { CajaComponent } from './configuracion/caja/caja.component';
import { UsuariosComponent } from './configuracion/usuarios/usuarios.component';
import { FacturaComponent } from './facturas/factura/factura.component';
import { MesasComponent } from './configuracion/mesas/mesas.component';
import { MesaComponent } from './ventas/mesa/mesa.component';
import { EmpresaComponent } from './configuracion/empresa/empresa.component';
import { CorteComponent } from './corte/corte.component';
import { CierresComponent } from './configuracion/cierres/cierres.component';
import { PrintComponent } from './ventas/print/print.component';
import { MovimientosComponent } from './productos/movimientos/movimientos.component';
import { NuevoComponent } from './productos/nuevo/nuevo.component';
import { DepartamentosComponent } from './productos/departamentos/departamentos.component';
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
import { ReportesComponent } from './configuracion/parqueadero/reportes/reportes.component';
import { DomiciliosComponent } from './domicilios/domicilios.component';
import { BodegasComponent } from './configuracion/bodegas/bodegas.component';
import { BodegaComponent } from './configuracion/bodega/bodega.component';
import { CompraComponent } from './compra/compra.component';
import { WaiterGuardPrivate } from '../guards/waiterPrivate.guard';
import { VehiculosComponent } from './vehiculos/vehiculos.component';

const routes: Routes = [
    
    { 
        path: 'dashboard', 
        component: PagesComponent,
        canActivate: [AuthGuard],
        children: [
    
          { path: '', component: DashboardComponent, data:{ titulo: 'Dashboard'} },
          { path: 'alquileres', component: AlquileresComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Alquileres'} },
          { path: 'alquiler/:id', component: AlquilerComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Alquiler'} },
          { path: 'domicilios', component: DomiciliosComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Domicilios'} },
          { path: 'calendario', component: CalendarioComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Calendario'} },
          { path: 'clientes', component: ClientesComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Clientes'} },
          { path: 'comandas', component: ComandaComponent, data:{ titulo: 'Comandas'} },
          { path: 'compra/:id', component: CompraComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Compra'} },
          
          { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AdminGuard], data:{ titulo: 'Configuracion'} },
          { path: 'configuracion/bancos', component: BancosComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Bancos'} },
          { path: 'configuracion/bodegas', component: BodegasComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Bodegas'} },
          { path: 'configuracion/bodega/:id', component: BodegaComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Bodega'} },
          { path: 'configuracion/caja', component: CajaComponent, canActivate: [AdminGuard], data:{ titulo: 'Caja' } },
          { path: 'configuracion/compras', component: ComprasComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Compras' } },
          { path: 'configuracion/cierres', component: CierresComponent, canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Cierres' } },
          { path: 'configuracion/empresa', component: EmpresaComponent, canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Mi Empresa' } },
          { path: 'configuracion/mesas', component: MesasComponent, canActivate: [AdminGuard], data:{ titulo: 'Mesas' } },
          { path: 'configuracion/usuarios', component: UsuariosComponent, canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Usuarios' } },
          { path: 'configuracion/impuestos', component: ImpuestosComponent,  canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Impuestos'} },
          
          { path: 'configuracion/prestamos', component: PrestamosComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Prestamos'} },
          { path: 'configuracion/prestamo/:id', component: PrestamoComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Prestamo'} },
          { path: 'configuracion/parqueadero', component: ParqueaderoComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Parqueadero'} },
          { path: 'parqueadero/reportes', component: ReportesComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Reportes'} },
          
          { path: 'corte', component: CorteComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Corte'} },


          { path: 'facturas', component: FacturasComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Facturas'} },
          { path: 'factura/:id', component: FacturaComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Detalles de factura' } },

          { path: 'inventario', component: InventarioComponent,  canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Inventario'} },
          { path: 'perfil', component: PerfilComponent, data:{ titulo: 'Perfil'} },

          { path: 'entradas-salidas', component: EntradasSalidasComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Entradas y Salidas'} },

          { path: 'pedido/:id', component: PedidoComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Pedido'} },
          { path: 'pedidos', component: PedidosComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Pedidos'} },

          { path: 'productos', component: ProductosComponent,  canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Productos'} },
          { path: 'producto/:id', component: ProductoComponent,  canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Producto'} },
          { path: 'productos/movimientos', component: MovimientosComponent,  canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Movimientos'} },
          { path: 'productos/nuevo', component: NuevoComponent,  canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Crear Producto Nuevo'} },
          { path: 'productos/departamento', component: DepartamentosComponent,  canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Departamentos'} },
          { path: 'productos/categorias', component: CategoriasComponent,  canActivate: [AdminGuard, WaiterGuardPrivate], data:{ titulo: 'Categorias'} },
          { path: 'productos/kardex', component: KardexComponent, canActivate: [WaiterGuardPrivate], data:{ titulo: 'Kardex'} },
          { path: 'productos/eliminados', component: EliminadosComponent,  canActivate: [AdminGuard, WaiterGuardPrivate],  data:{ titulo: 'Kardex'} },
          
          { path: 'proveedores', component: ProveedoresComponent,  canActivate: [AdminGuard, AdminGuard], data:{ titulo: 'Kardex'} },
          
          { path: 'vehiculos', component: VehiculosComponent,  canActivate: [AdminGuard], data:{ titulo: 'Vehiculos'} },
          { path: 'ventas', component: VentasComponent,  canActivate: [WaiterGuard], data:{ titulo: 'Ventas'} },
          { path: 'ventas/mesa/:id', component: MesaComponent,  canActivate: [WaiterGuard], data:{ titulo: 'Mesa'} },
          { path: 'ventas/print/:id', component: PrintComponent,  canActivate: [WaiterGuard], data:{ titulo: 'Imprimir Factura'} }
              
        ]
      },    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}
