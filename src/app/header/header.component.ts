import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { TokenStorageService } from '../auth/token-storage.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ParametroService } from '../parametro.service';
//import { Router } from '@angular/router';
//import { UsuarioService } from '../usuario.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  auth = false
  email:string;
  name:string;
  
  rolesGrant:any[]=[];
  roles:any[]=[];
  modules:any[]=[];
  modalContent;
  modalReference;

  seeConf;
  seeGD;
  seeGR;
  seeReportGD;
  seeReportGR;

  refresh;
  refreshTime;

  constructor(private httpClient: HttpClient, 
    private token: TokenStorageService, private modalService: NgbModal,
    private parametroService: ParametroService) { }

  ngOnInit() {    

    if(this.token.getToken()) this.auth = true;

    if(this.auth){
      this.parametroService.getParametroDefault('Refrescar Pagina').
      subscribe((refresh: any)=>{
          //console.log("Refresh: ",refresh)
          if(refresh === "true"){
            this.parametroService.getParametroDefault('Tiempo Refresco').
            subscribe((refreshTime: any)=>{

                //console.log("Refresh Time: ",refreshTime)
                setInterval(function() {
                  //console.log("Recarga")
                  window.location.reload();
                }, refreshTime*100000); 
            });
          }
      });
    }
    
    this.email = this.token.getEmail();
    this.name = this.token.getName();
    this.rolesGrant = this.token.getRoles();
    
    this.seeGD = false;
    this.seeGR = false;
    this.seeConf = false;
    this.seeReportGD = false;
    this.seeReportGR = false;

    for(let i=0;i<this.rolesGrant.length;i++){
      /*if(!this.roles.includes(this.rolesGrant[i].rol_name))
        this.roles.push(this.rolesGrant[i].rol_name)
      if(!this.modules.includes(this.rolesGrant[i].mod_nombre))
        this.modules.push(this.rolesGrant[i].mod_nombre)*/

      if(this.rolesGrant[i].rol_name === 'Administrativo'){
        this.seeGR = true;
        this.seeReportGR = true;
      }

      if(this.rolesGrant[i].rol_name === 'Visualizador'){
        this.seeGD = true;
        this.seeGR = true;
        this.seeReportGD = true;
        this.seeReportGR = true;
      }

      if(this.rolesGrant[i].rol_name === 'Operador' ||
        this.rolesGrant[i].rol_name === 'Operador +'){
        this.seeGD = true;
      }

      if(this.rolesGrant[i].rol_name === 'Supervisor'){
        this.seeGD = true;
        this.seeGR = true;
        this.seeReportGD = true;
        this.seeReportGR = true;
      }

      if(this.rolesGrant[i].rol_name === 'Administrador'){
        this.seeGD = true;
        this.seeGR = true;
        this.seeConf = true;
        this.seeReportGD = true;
        this.seeReportGR = true;
      }

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


  }

  openModal(content) {
    this.modalContent = {'name':this.name, 'email':this.email, 'roles':this.rolesGrant }
    this.modalReference = this.modalService.open(content, { size: 'lg' });    
  }


  logout(): void {
    this.token.signOut();
    window.location.href = "/login";
  }

}
