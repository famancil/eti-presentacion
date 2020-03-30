import { Injectable,Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { map, share, takeLast} from 'rxjs/operators';
import {Subject} from "rxjs";
import { TokenStorageService } from './auth/token-storage.service';
import {environment} from '../environments/environment'
import {ParametroService} from './parametro.service'

@Injectable({
  providedIn: 'root'
})
export class GuiaService {

  httpOptions;

  constructor(private httpClient: HttpClient, private token: TokenStorageService,
    @Inject('BACKEND_API_URL') private URL: string,
    @Inject('PROXYDTE_URL') private URLProDTE: string,  
    private parametroService:ParametroService) {}

  getGuiaById(id): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/guias/'+id)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getGuiaByFolio(folio:string): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/guiasByFolio/'+folio)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getAllGuias(): Observable<any> {
    const token = this.token.getToken();   
    const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    })
    }
   return this.httpClient.get<any>(this.URL+'/guias',httpOptions)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getGuiaEstado(id:number): Observable<any> {
   return this.httpClient.get<any>(this.URL+'/guiaEstados/'+id)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getGuiaPDFByTicket(folio,fecha): Observable<any> {
   this.httpOptions = {responseType: 'blob'}
   return this.httpClient.get<any>(this.URL+'/guiasPDF/cliente/'+fecha+"/"+folio, this.httpOptions)
  }

  getGuiaPDFString(folio,fecha): String {
   return this.URL+'/guiasPDF/cliente/'+fecha+"/"+folio;
  }

  getGuiaPDFCedible(folio,fecha): Observable<any> {
   this.httpOptions = {responseType: 'blob'}
   return this.httpClient.get<any>(this.URL+'/guiasPDF/cedible/'+fecha+"/"+folio, this.httpOptions)
  }

  getGuiaPDFCedibleString(folio,fecha): String {
   return this.URL+'/guiasPDF/cedible/'+fecha+"/"+folio;
  }

  getGuiaEscaneadaByTicket(folio): Observable<any> {
   this.httpOptions = {responseType: 'blob'}
   return this.httpClient.get<any>(this.URL+'/guiasEscaneadas/2019-09-08/'+folio, this.httpOptions)
  }

  getGuiaEscaneadaString(folio): String {
   return this.URL+'/guiasEscaneadas/2019-09-08/'+folio;
  }

  getAllGuiasFiltradaPorCentros(centros:any[]): Observable<any> {
   const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
   let params = {};
    for (let i=0;i<centros.length;i++) {
      params['centro'+i] = centros[i];
    }
    console.log(params)
   return this.httpClient.post<any>(this.URL+'/guiasCentros', params,httpOptions)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  getAllGuiaHistorial(id:number): Observable<any>{
    return this.httpClient.get<any>(this.URL+'/guiasHistorials/'+id)
  }

  getAllGuiaByRangeDate(fecha_inicial: any, fecha_final:any,
    t_inicio:any,t_final:any,centros:any[]): Observable<any>{
    
    let params = {'fecha_inicial':fecha_inicial, 
    'fecha_final':fecha_final, 't_inicio':t_inicio,'t_final':t_final }

    for (let i=0;i<centros.length;i++)params['centro'+i] = centros[i];
    
    //console.log(params);
    return this.httpClient.post<any>(this.URL+'/guiasByFechas',params)
  }

  getAllGuiaEmiScanRepByRangeDate(fecha_inicial: any, fecha_final:any,
    t_inicio:any,t_final:any,centros:any[]): Observable<any>{
    
    let params = {'fecha_inicial':fecha_inicial, 
    'fecha_final':fecha_final, 't_inicio':t_inicio,'t_final':t_final }

    for (let i=0;i<centros.length;i++)params['centro'+i] = centros[i];
    
    //console.log(params);
    return this.httpClient.post<any>(this.URL+'/emitidas/guiasByFechas/',params)
  }

  getAllGuiaEmiScanRepByHoras(dia:number, starTime:any, endTime:any, 
    centros:any[],estado:any): Observable<any>{
    
    let params = {'dia':dia, 'hora_comienzo':starTime.hour, 
    'minutos_comienzo':starTime.minute, 'hora_final':endTime.hour, 
    'minutos_final':endTime.minute, 'estado':estado}
    for (let i=0;i<centros.length;i++)params['centro'+i] = centros[i];
    //console.log(params);
    return this.httpClient.post<any>(this.URL+'/guiasByEstadoHoras',params)
  }

  getTotalEmitidasByHoras(dia:number, starTime:any, endTime:any, 
    centros:any[]): Observable<any>{
    
    let params = {'dia':dia, 'hora_comienzo':starTime.hour, 
    'minutos_comienzo':starTime.minute, 'hora_final':endTime.hour, 
    'minutos_final':endTime.minute}
    for (let i=0;i<centros.length;i++)params['centro'+i] = centros[i];
    //console.log(params);
    return this.httpClient.post<any>(this.URL+'/guias/totalESR',params)
  }

  getAllGuiaByHoras(dia:number, starTime:any, endTime:any, 
    centros:any[]): Observable<any>{
    
    let params = {'dia':dia, 'hora_comienzo':starTime.hour, 
    'minutos_comienzo':starTime.minute, 'hora_final':endTime.hour, 
    'minutos_final':endTime.minute}
    for (let i=0;i<centros.length;i++)params['centro'+i] = centros[i];
    //console.log(params);
    return this.httpClient.post<any>(this.URL+'/guiasByHoras',params)
  }

  getAllGuiaByEstado(estado:string, centros:any[]): Observable<any>{
    let params = {'estado':estado}
    for (let i=0;i<centros.length;i++)params['centro'+i] = centros[i];
    return this.httpClient.post<any>(this.URL+'/guiasByEstado',params)
  }

  getAllGuiaByEstadoAndHoras(startDate:any, endDate:any, 
    estado:string,centros:any[]): Observable<any>{

    let params = {'estado':estado,'fecha_comienzo_año':startDate.year,
    'fecha_comienzo_mes':startDate.month,'fecha_comienzo_dia':startDate.day,
    'fecha_final_año':endDate.year, 'fecha_final_mes':endDate.month,
    'fecha_final_dia':endDate.day}
    for (let i=0;i<centros.length;i++)params['centro'+i] = centros[i];
    return this.httpClient.post<any>(this.URL+'/guiasByEstadoAndHoras',params)
  }


  actualizarEstadoGuia(id:number, observacion:string , estado:string,
    name:string): Observable<any> {
   const params = {'estado':estado, 'observacion': observacion, 'usuario': name}
   return this.httpClient.post<any>(this.URL+'/guias/'+id+'/guiaEstado/',params)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  actualizarGuia(id:number, nro_sello:string, usuario:string): Observable<any> {
   const params = {'nro_sello':nro_sello, 'usuario': usuario}
   return this.httpClient.put<any>(this.URL+'/guias/'+id,params)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  actualizarGuiaEmitida(id:number, nro_sello:string, usuario:string): Observable<any> {
   const params = {'nro_sello':nro_sello, 'usuario': usuario}
   return this.httpClient.put<any>(this.URL+'/guias/'+id+'/emitirGuia',params)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  emitirGuia(id:number): Observable<any> {
   return this.httpClient.get<any>(this.URLProDTE+'/emitirGuia/'+id)
     .pipe(
       retry(1),
       catchError(this.handleError)
     );
  }

  subscribe(): Subject<any> {
    //console.log("llamado a oreja")
    //console.log(this.URLProDTE);
    let subscription = new Subject();
    /*this.parametroService.getURListen().subscribe((data: any)=>{
      //URListen = data.valor;
      //let eventSource = new EventSource(this.URL+'/subscribe');
      let eventSource = new EventSource(URListen+'/subscribe');          
      eventSource.addEventListener("message", event=> {
          console.info("Got event: " + event);
          subscription.next(event);
      });      
    });*/

    let eventSource = new EventSource(this.URLProDTE+'/subscribe');          
      eventSource.addEventListener("message", event=> {
          console.info("Got event: " + event);
          subscription.next(event);
      });
    return subscription;    
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
