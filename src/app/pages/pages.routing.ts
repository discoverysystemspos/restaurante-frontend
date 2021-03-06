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

const routes: Routes = [
    
    { 
        path: 'dashboard', 
        component: PagesComponent,
        canActivate: [AuthGuard],
        children: [
    
          { path: '', component: DashboardComponent, data:{ titulo: 'Dashboard'} },
          { path: 'clientes', component: ClientesComponent, data:{ titulo: 'Clientes'} },
          { path: 'compras', component: ComprasComponent, data:{ titulo: 'Compras'} },
          
          { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AdminGuard], data:{ titulo: 'Configuracion'} },
          { path: 'configuracion/caja', component: CajaComponent, canActivate: [AdminGuard], data:{ titulo: 'Caja' } },
          { path: 'configuracion/cierres', component: CierresComponent, canActivate: [AdminGuard], data:{ titulo: 'Cierres' } },
          { path: 'configuracion/empresa', component: EmpresaComponent, canActivate: [AdminGuard], data:{ titulo: 'Mi Empresa' } },
          { path: 'configuracion/mesas', component: MesasComponent, canActivate: [AdminGuard], data:{ titulo: 'Mesas' } },
          { path: 'configuracion/usuarios', component: UsuariosComponent, canActivate: [AdminGuard], data:{ titulo: 'Usuarios' } },

          { path: 'corte', component: CorteComponent, data:{ titulo: 'Corte'} },

          { path: 'facturas', component: FacturasComponent, data:{ titulo: 'Facturas'} },
          { path: 'factura/:id', component: FacturaComponent, data:{ titulo: 'Detalles de factura' } },

          { path: 'inventario', component: InventarioComponent,  canActivate: [AdminGuard], data:{ titulo: 'Inventario'} },
          { path: 'perfil', component: PerfilComponent, data:{ titulo: 'Perfil'} },

          { path: 'productos', component: ProductosComponent,  canActivate: [AdminGuard], data:{ titulo: 'Productos'} },
          { path: 'producto/:id', component: ProductoComponent,  canActivate: [AdminGuard], data:{ titulo: 'Producto'} },
          { path: 'productos/movimientos', component: MovimientosComponent,  canActivate: [AdminGuard], data:{ titulo: 'Movimientos'} },
          { path: 'productos/nuevo', component: NuevoComponent,  canActivate: [AdminGuard], data:{ titulo: 'Crear Producto Nuevo'} },
          { path: 'productos/departamento', component: DepartamentosComponent,  canActivate: [AdminGuard], data:{ titulo: 'Departamentos'} },
          
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
