import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DashboradModule } from './dashborad/dashborad.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthinterceptorInterceptor } from './authinterceptor.interceptor';
import { MatDialog } from '@angular/material/dialog';

@NgModule({
  declarations: [AppComponent ],
  imports: [
    AppRoutingModule,
    DashboradModule,
    BrowserModule,
    BrowserAnimationsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthinterceptorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
