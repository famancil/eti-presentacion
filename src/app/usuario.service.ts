import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  //URL: string = environment.apiEndpoint
  //URL: string;

  constructor(private httpClient: HttpClient, 
    @Inject('BACKEND_API_URL') private URL: string) {}  
  
  getAllUserKeycloak(): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/usuarios')
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  handleError(error) {
   let errorMessage = '';
   if (error.error instanceof ErrorEvent) {
     // client-side error
     errorMessage = `Error: ${error.error.message}`;
   } else {
     // server-side error
     errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
   }
   window.alert(errorMessage);
   return throwError(errorMessage);
  }

  
  /*public createParametro(parametro: Parametro){
    return this.httpClient.post(this.URL,parametro);
  }*/
}
