import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { KeycloakService } from './keycloak.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private kcService: KeycloakService,  private router: Router) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authToken = this.kcService.getToken() || '';
        request = request.clone({
            setHeaders: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            }
        });
        return next.handle(request).pipe(
          catchError((err: HttpErrorResponse) => {

            if (err.status === 401) {
              this.router.navigateByUrl('/');
            }

            return throwError( err );

          })
        );
    }
}