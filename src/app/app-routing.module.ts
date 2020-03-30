import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, PreloadAllModules}  from '@angular/router';

import { ParametroComponent } from './parametro/parametro.component';
import { GuiaDespachoComponent } from './guia-despacho/guia-despacho.component';
import { GuiaDespachoRepasarComponent } from './guia-despacho-repasar/guia-despacho-repasar.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ReporteComponent } from './reporte/reporte.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { GuiaDespachoOperacionComponent } from './guia-despacho-operacion/guia-despacho-operacion.component';
import { GuiaDespachoRepasarBlankComponent } from './guia-despacho-repasar-blank/guia-despacho-repasar-blank.component';
import { LoginService } from './login.service';


const routes: Routes = [
  {path: '', component: HomeComponent, 
  //data: { preload: true }, pathMatch: 'full'},
  data: { preload: true }, pathMatch: 'full', canActivate: [LoginService] },

  {path: 'configuracion', component: ParametroComponent, //data: { preload: true }},
  data: { preload: true }, canActivate: [LoginService] },

  {path: 'guiasDespacho', component: GuiaDespachoComponent, //data: { preload: true }},
  data: { preload: true }, canActivate: [LoginService] },
  
  {path: 'guiasDespacho/:id', component: GuiaDespachoRepasarComponent, //data: { preload: true }},
  data: { preload: true }, canActivate: [LoginService]},
  //data: { preload: true }},
  /*{path: 'reportes', component: ReporteComponent, //data: { preload: true }},
  data: { preload: true }, canActivate: [LoginService]},*/
  //data: { preload: true }},
  {path: 'login', component: LoginComponent, data: { preload: true }},

  {path: 'guiasDespachoOperacion', component: GuiaDespachoOperacionComponent, 
  data: { preload: true }, canActivate: [LoginService]},

  {path: 'guia', component: GuiaDespachoRepasarBlankComponent,
  data: { preload: true }, canActivate: [LoginService]},

  {path: '**', component: HomeComponent}
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(
      routes,
      { preloadingStrategy: PreloadAllModules}
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
