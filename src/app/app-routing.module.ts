import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// MODULES
import { PagesRoutingModule } from './pages/pages.routing';
import { AuthRoutingModule } from './auth/auth.routing';

// COMPONENTS
import { NopagefoundComponent } from './nopagefound/nopagefound.component';
import { MenuComponent } from './menu/menu.component';
import { ShopComponent } from './shop/shop.component';

const routes: Routes = [
  
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'menu/:id', component: MenuComponent },
  { path: 'shop', component: ShopComponent },
  { path: '**', component: NopagefoundComponent }  

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    PagesRoutingModule,
    AuthRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
