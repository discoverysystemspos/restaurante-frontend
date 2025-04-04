import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import localEs from '@angular/common/locales/es-CO'
import localeEn from '@angular/common/locales/en';
import { registerLocaleData } from '@angular/common'

registerLocaleData(localEs, 'es-CO');
registerLocaleData(localeEn, 'en-US');

// MODULES
import { AppRoutingModule } from './app-routing.module';
import { PagesModule } from './pages/pages.module';
import { AuthModule } from './auth/auth.module';

// COMPONENTS
import { AppComponent } from './app.component';
import { NopagefoundComponent } from './nopagefound/nopagefound.component';
// import { CalendarModule, DateAdapter  } from 'angular-calendar';
// import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';s
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent } from './menu/menu.component';
import { PipesModule } from './pipes/pipes.module';
import { ShopComponent } from './shop/shop.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    NopagefoundComponent,
    MenuComponent,
    ShopComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PagesModule,
    AuthModule,    
    NgbModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: LOCALE_ID, useValue: 'en-US' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
