//import { Component } from '@angular/core';
//import { Column, GridOption, GridState, AngularGridInstance } from 'angular-slickgrid';
/*import { CommentsService } from './comments.service';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';*/

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TokenStorageService } from './auth/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  auth = false;

  constructor(
  	private token: TokenStorageService){}
  
  ngOnInit() {
  	if(this.token.getToken()) this.auth = true;
  }
  
  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
