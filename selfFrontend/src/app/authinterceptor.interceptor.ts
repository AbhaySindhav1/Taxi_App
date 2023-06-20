import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpParams,
} from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { AuthService } from './Services/auth.service';

@Injectable()
export class AuthinterceptorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const userdata = localStorage.getItem('userData');
    let user;

    if (userdata !== null) {
      user = JSON.parse(userdata);
    }

    if (user && user._token) {
      const modifiedReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${user._token}`,
        },
      });
      return next.handle(modifiedReq);
      // .pipe(
      //   catchError((error) => {
      //     console.error('Error occurred:', error);
      //     if (
      //       error.error == 'Authentication Failed' ||
      //       error.error == 'please auth'
      //     ) {
      //       // You can also perform any additional error handling or actions here
      //       this.authService.logout();
      //     }
      //     return of(error); // Returning a new observable with the error
      //   })
      // );
    } else {
      return next.handle(request);
    }
  }
}
