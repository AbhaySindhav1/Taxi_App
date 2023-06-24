import { Component, OnInit } from '@angular/core';
import { SocketService } from './Services/socket.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'MainTask';

  constructor(
    private bnIdle: BnNgIdleService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.bnIdle.startWatching(60*20).subscribe((isTimedOut: boolean) => {
      console.log(isTimedOut,this.authService.user.getValue());
      
      if (this.authService.user.getValue()) {
        if (isTimedOut) {
          this.authService.user.next(false);
          console.log('session expired');
          this.authService.logout();
        }
      }
    });
  }
}
