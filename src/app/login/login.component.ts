import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { TokenStorageService } from '../auth/token-storage.service';
import { AuthLoginInfo } from '../auth/login-info';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: any = {};
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: any[] = [];
  private loginInfo: AuthLoginInfo;
  resultQuery;

  constructor(private authService: AuthService, 
  	private tokenStorage: TokenStorageService, private http: HttpClient) { }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
    }
  }

  onSubmit() {

    this.loginInfo = new AuthLoginInfo(
      this.form.email+'@grupocbb.cl',
      this.form.password);

    this.authService.attemptAuth(this.loginInfo).subscribe(
      data => {
      	console.log(data)
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveEmail(data.email);
        this.tokenStorage.saveName(data.name);
        this.tokenStorage.saveRoles(data.roles);

        this.isLoginFailed = false;
        this.isLoggedIn = true;

        window.location.href = "/";
      },
      error => {
        console.log(error);

        if(error.status === 404)
          this.errorMessage = "Email y/o contraseña incorrectas. Favor intente nuevamente";
        this.isLoginFailed = true;
      }
    );
  }

}
