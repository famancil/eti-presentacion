import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER} from '@angular/core';
import { AngularSlickgridModule } from 'angular-slickgrid';
//import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppRoutingModule } from './app-routing.module';
import { NgxSpinnerModule } from "ngx-spinner";

import { NgbDateFRParserFormatter } from './ngb-date-fr-parser-formatter';
import { NgbUTCStringAdapter} from './ngb-UTC-string-adapter';

import {
  NgbDropdownModule,
  NgbModule,
  NgbPopover,
  NgbTabsetModule,
  NgbDatepicker,
  NgbDatepickerModule,
  NgbDatepickerConfig,
  NgbDateParserFormatter,
  NgbDateAdapter,
  NgbActiveModal
} from "@ng-bootstrap/ng-bootstrap";


import { AppComponent } from './app.component';

import { ParametroService } from './parametro.service';
import { GuiaRepasoService } from './guia-repaso.service';
import { GuiaService } from './guia.service';
//import { KeycloakService } from './keycloak.service';
import {LoginService} from './login.service';
import { UsuarioService } from './usuario.service';
import { ParametroComponent } from './parametro/parametro.component';
import { GuiaDespachoComponent } from './guia-despacho/guia-despacho.component';
import { GuiaDespachoRepasarComponent } from './guia-despacho-repasar/guia-despacho-repasar.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ReporteComponent } from './reporte/reporte.component';

//import { TokenInterceptor } from './token.interceptor';
import { LoginComponent } from './login/login.component';

import { httpInterceptorProviders } from './auth/auth-interceptor';
import { HomeComponent } from './home/home.component';
import { GuiaDespachoOperacionComponent } from './guia-despacho-operacion/guia-despacho-operacion.component';

import { DatePipe } from '@angular/common'
import $ from 'jquery';
//import { ChartsModule } from 'ng2-charts';

import { SettingsHttpService } from './settings.http.service';

import {environment} from '../environments/environment';
import { GuiaDespachoRepasarBlankComponent } from './guia-despacho-repasar-blank/guia-despacho-repasar-blank.component';

/*export function kcFactory(keycloakService: KeycloakService) {
  return () => keycloakService.init();
}*/

export function app_Init(settingsHttpService: SettingsHttpService) {
  return () => settingsHttpService.initializeApp();
}

@NgModule({
  declarations: [
    AppComponent,
    ParametroComponent,
    GuiaDespachoComponent,
    GuiaDespachoRepasarComponent,
    HeaderComponent,
    FooterComponent,
    ReporteComponent,
    LoginComponent,
    HomeComponent,
    GuiaDespachoOperacionComponent,
    GuiaDespachoRepasarBlankComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularSlickgridModule.forRoot(),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    AppRoutingModule,
    NgxSpinnerModule
    //ChartsModule
  ],
  providers: [ParametroService,{
      provide: NgbDateParserFormatter,
      useClass: NgbDateFRParserFormatter
    },
    { provide: APP_INITIALIZER, 
      useFactory: app_Init, 
      deps: [SettingsHttpService], 
      multi: true 
    },
    {provide: 'BACKEND_API_URL', useValue: environment.apiEndpoint},
    {provide: 'PROXYDTE_URL', useValue: environment.listenEndpoint},
    {
        provide: NgbDateAdapter,
        useClass: NgbUTCStringAdapter
    },
    GuiaRepasoService,GuiaService
    ,UsuarioService,LoginService,
    httpInterceptorProviders, DatePipe,NgbActiveModal],
  bootstrap: [AppComponent]
})
export class AppModule { }
