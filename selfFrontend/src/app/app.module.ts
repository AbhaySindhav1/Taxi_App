import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DashboradModule } from './dashborad/dashborad.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthinterceptorInterceptor } from './authinterceptor.interceptor';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';
import { PopUpComponent } from './pages/pop-up/pop-up.component';

@NgModule({
  declarations: [AppComponent, PopUpComponent],
  imports: [
    AppRoutingModule,
    DashboradModule,
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MatDialogModule,
    MatDialogModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthinterceptorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
