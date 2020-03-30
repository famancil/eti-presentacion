import { Injectable } from '@angular/core';

declare var Keycloak: any;

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  //Keycloak: any;

  private keycloakAuth: any;
  static auth: any = {};

  constructor() { }

  init(): Promise<any> {
   return new Promise((resolve, reject) => {
      const config = {
        'url': 'http://172.31.7.3:8081/auth',
        'realm': 'SpringBootKeycloak',
        'clientId': 'angular-test-app'
      };
      this.keycloakAuth = new Keycloak(config);

      KeycloakService.auth.loggedIn = false;

      this.keycloakAuth.init({ onLoad: 'login-required' })
        .success((auth) => {
          if (!auth) {
            window.location.reload();
          } else {
            console.log("Authenticated");
          }

          KeycloakService.auth.loggedIn = true;

          KeycloakService.auth.authz = this.keycloakAuth;


          KeycloakService.auth.logoutUrl = this.keycloakAuth.authServerUrl +
          "/realms/SpringBootKeycloak/protocol/openid-connect/logout?redirect_uri=" +
          document.baseURI;

          resolve();
        })
        .error(() => {
          reject();
        });
      });
  }

  getToken(): string {
    return this.keycloakAuth.token;
  }

  logout(): any {
    localStorage.clear();
    console.log(this.keycloakAuth.endpoints);
    
    window.location.href = this.keycloakAuth.endpoints.logout()
  }

  static logout() {

    KeycloakService.auth.loggedIn = false;
    KeycloakService.auth.authz = null;
    window.location.href = KeycloakService.auth.logoutUrl;
  }


}