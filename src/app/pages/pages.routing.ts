import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// GUARD
import { AuthGuard } from '../guards/auth.guard';

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


const routes: Routes = [
    
    { 
        path: 'dashboard', 
        component: PagesComponent,
        canActivate: [AuthGuard],
        children: [
    
          { path: '', component: DashboardComponent, data:{ titulo: 'Dashboard'} },
          { path: 'clientes', component: ClientesComponent, data:{ titulo: 'Clientes'} },
          { path: 'compras', component: ComprasComponent, data:{ titulo: 'Compras'} },
          
          { path: 'configuracion', component: ConfiguracionComponent, data:{ titulo: 'Configuracion'} },
          { path: 'configuracion/caja', component: CajaComponent, data:{ titulo: 'Caja' } },
          { path: 'configuracion/cierres', component: CierresComponent, data:{ titulo: 'Cierres' } },
          { path: 'configuracion/empresa', component: EmpresaComponent, data:{ titulo: 'Mi Empresa' } },
          { path: 'configuracion/mesas', component: MesasComponent, data:{ titulo: 'Mesas' } },
          { path: 'configuracion/usuarios', component: UsuariosComponent, data:{ titulo: 'Usuarios' } },

          { path: 'corte', component: CorteComponent, data:{ titulo: 'Corte'} },

          { path: 'facturas', component: FacturasComponent, data:{ titulo: 'Facturas'} },
          { path: 'factura/:id', component: FacturaComponent, data:{ titulo: 'Detalles de factura' } },

          { path: 'inventario', component: InventarioComponent, data:{ titulo: 'Inventario'} },
          { path: 'perfil', component: PerfilComponent, data:{ titulo: 'Perfil'} },
          { path: 'productos', component: ProductosComponent, data:{ titulo: 'Productos'} },
          { path: 'producto/:id', component: ProductoComponent, data:{ titulo: 'Producto'} },
          
          { path: 'ventas', component: VentasComponent, data:{ titulo: 'Ventas'} },
          { path: 'ventas/mesa/:id', component: MesaComponent, data:{ titulo: 'Mesa'} },
          { path: 'ventas/print/:id', component: PrintComponent, data:{ titulo: 'Imprimir Factura'} }
              
        ]
      },    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}
