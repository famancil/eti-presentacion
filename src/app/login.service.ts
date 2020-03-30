import { Injectable } from '@angular/core';
import { Router, 
	CanActivate, 
	ActivatedRouteSnapshot, 
	RouterStateSnapshot 
} from '@angular/router';
import { TokenStorageService } from './auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService implements CanActivate {

  modules:any[]=[];
  rolesGrant:any[]=[];

  canOperate=false;
  canRepaso=false;
  canConfiguracion=false;
  canReporteOperacion = false;
  canReporteRepaso = false;

  constructor(private router: Router, private token: TokenStorageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    
    this.rolesGrant = this.token.getRoles();    
    
    for(let i=0;i<this.rolesGrant.length;i++){
      if(!this.modules.includes(this.rolesGrant[i].mod_nombre))
        this.modules.push(this.rolesGrant[i].mod_nombre)

      if(this.rolesGrant[i].rol_name === 'Visualizador' ||
          this.rolesGrant[i].rol_name === 'Operador' ||
          this.rolesGrant[i].rol_name === 'Operador +' ||
          this.rolesGrant[i].rol_name === 'Supervisor' ||
          this.rolesGrant[i].rol_name === 'Administrador')
        this.canOperate = true;

      if(this.rolesGrant[i].rol_name === 'Visualizador' ||
          this.rolesGrant[i].rol_name === 'Supervisor' ||
          this.rolesGrant[i].rol_name === 'Administrador')
        this.canReporteOperacion = true;

      if(this.rolesGrant[i].rol_name === 'Visualizador' ||
          this.rolesGrant[i].rol_name === 'Administrativo' ||
          this.rolesGrant[i].rol_name === 'Supervisor' ||
          this.rolesGrant[i].rol_name === 'Administrador')
        this.canRepaso = true;

      if(this.rolesGrant[i].rol_name === 'Visualizador' ||
          this.rolesGrant[i].rol_name === 'Administrativo' ||
          this.rolesGrant[i].rol_name === 'Supervisor' ||
          this.rolesGrant[i].rol_name === 'Administrador')
        this.canReporteRepaso = true;

      if(this.rolesGrant[i].rol_name === 'Administrador')
        this.canConfiguracion = true;
    }
    /*if(this.modules.includes("GuiaDespacho"))
      this.seeGD = true;
    if(this.modules.includes("Repaso"))
      this.seeGR = true;
    if(this.modules.includes("Configuración"))
      this.seeConf = true;
    //console.log(this.modules)
    if(this.modules.includes("Reportes"))
      this.seeReport = true;*/
    /*var string = "/guiasDespacho/431",
    substring = "/guiasDespacho";*/
    /*console.log(state.url)
    console.log(string.indexOf(substring) !== -1);*/
    const token = this.token.getToken();
    if (token) {
      // logged in so return true

      if(state.url === '/configuracion' && !this.canConfiguracion){
        window.location.href='/';
        return false;
      }
      else if(state.url === '/guiasDespachoOperacion' && !this.canOperate){
        window.location.href='/';
        return false;
      }
      else if(state.url === '/guiasDespacho' && !this.canRepaso){
        window.location.href='/'
        return false;
      }
      else if(state.url.indexOf("/guiasDespacho/") !== -1 && !this.canRepaso){
        window.location.href='/';
        return false;
      }
      else if(state.url === '/reportes' && !this.canReporteOperacion &&
        !this.canReporteRepaso){
        window.location.href='/';
        return false;
      }
      else if(state.url === '/guia' && !this.canRepaso){
        window.location.href='/';
        return false;
      }


      return true;
    }




    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}
