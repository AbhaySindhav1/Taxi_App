import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpParams,
} from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { AuthService } from './Services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthinterceptorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toaster: ToastrService
  ) {}

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
      // const storedTimeOut = localStorage.getItem('TimeOut');
      // if (storedTimeOut && Date.now() > parseInt(storedTimeOut)) {
      //   console.log(storedTimeOut && Date.now());
      //   console.log(storedTimeOut, Date.now());
      //   this.authService.logout();
      // }

      // localStorage.setItem('TimeOut', (Date.now() + 5 * 1000).toString());
      return next.handle(modifiedReq).pipe(
        catchError((error) => {
          if (
            error.error === 'Authentication Failed' ||
            error.error === 'please auth'
          ) {
            // Handle specific errors here
            this.authService.logout();
          }
          // Let other errors be handled by their respective components
          throw error;
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
