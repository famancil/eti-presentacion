import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { GuiaRepaso } from './guia-repaso';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class GuiaRepasoService {
  
  constructor(private httpClient: HttpClient, 
    @Inject('BACKEND_API_URL') private URL: string) { }

  createGuiaRepaso(datos: GuiaRepaso, idGuia: any): Observable<any> {
   return this.httpClient.post<any>(this.URL+'/guiaRepasos/'+idGuia,datos)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getGuiaRepaso(idGuia: any): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/guiaRepasos/'+idGuia)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  tiempoGuiaRepaso(idGuia: any): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/guiaRepasos/'+idGuia+'/tiempos')
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
}
