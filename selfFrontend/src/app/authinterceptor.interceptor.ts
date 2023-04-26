import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthinterceptorInterceptor implements HttpInterceptor {
  constructor() {}

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
          Authorization: `Bearer ${user._token}`
        }
      });
      return next.handle(modifiedReq);
    } else {
      return next.handle(request);
    }
  }
}
