import { Component, OnInit } from '@angular/core';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthService } from './Services/auth.service';
import { MessagingService } from './Services/messaging.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'MainTask';
  message: any;

  constructor(
    private bnIdle: BnNgIdleService,
    private authService: AuthService,
    private messagingService: MessagingService,
    private messaging: AngularFireMessaging
  ) {}
  ngOnInit(): void {
    // this.messagingService.receiveMessaging();
    // this.message = this.messagingService.currentMessage;
    this.messaging.requestPermission.subscribe({
      next:(data:any)=>{
        console.log('permission granted!',data);
        // this.messagingService.reqForPermission();
      },error:(error)=>{
        console.log('permission denied');
      }
    })


    this.bnIdle.startWatching(60 * 20).subscribe((isTimedOut: boolean) => {
      console.log(isTimedOut, this.authService.user.getValue());

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
