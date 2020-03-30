import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { Parametro } from './parametro';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {

  json: any[];
  jsonArray: any[];
  parametro: Parametro;
  //URL: string = environment.apiEndpoint

  constructor(private httpClient: HttpClient, 
    @Inject('BACKEND_API_URL') private URL: string) {}

  getParametroByName(planta:string,name:string): Observable<any> {
   const params = {'planta':planta, 'name': name}
   return this.httpClient.post<any>(this.URL+'/parametrosByName',params)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  } 

  getParametroDefault(valor:string): Observable<any> {
   const requestOptions: Object = {
    /* other options here */
    responseType: 'text'
   }
   const params = {"valor":valor}
   return this.httpClient.post<any>(this.URL+'/parametrosByValor',params,requestOptions)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  } 

  /*getURListen(): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/parametroURListen')
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  } */ 
  
  getAllCodCentro(): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/parametrosAllCodCentro')
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getAllLaboratorios(): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/parametros/laboratorios')
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getAllTipoAditivos(): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/parametros/aditivos')
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getAllCodPlantaByCodCentro(codCentro): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/parametrosAllCodPlantaByCodCentro/'+codCentro)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getParametrosExceptExcepcion(): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/parametrosByAllCategoriesExceptExcepcion')
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  createParametro(parametro: Parametro): Observable<any> {
   return this.httpClient.post<any>(this.URL+'/parametros',parametro)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  updateParametro(parametro: Parametro): Observable<any> {
   return this.httpClient.put<any>(this.URL+'/parametros/'+parametro.id,parametro)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getParametrosExcepcion(parametro: string): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/parametrosByCategoryExcepcion/'+parametro)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  deleteParametro(id: number): Observable<{}> {
   return this.httpClient.delete(this.URL+'/parametros/'+id)
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