import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  currentMessage = new BehaviorSubject<any>(null);
  constructor(private firebaseMessaging: AngularFireMessaging) {}

  reqForPermission() {
    this.firebaseMessaging.requestToken.subscribe({
      next: (token) => {
        console.log(token);
      },
      error: (error) => {
        console.log('unable to get permisson', error);
      },
    });
  }

  receiveMessaging() {
    this.firebaseMessaging.messages.subscribe({
      next: (payload) => {
        console.log('new message received', payload);
        this.currentMessage.next(payload);
      },
      error: (error) => {
        console.log('unable to get permisson', error);
      },
    });
  }
}

// import { Injectable } from '@angular/core';
// import { AngularFireMessaging } from '@angular/fire/compat/messaging';
// import { BehaviorSubject } from 'rxjs';
// @Injectable()
// export class MessagingService {
//   currentMessage = new BehaviorSubject(null);
//   constructor(private angularFireMessaging: AngularFireMessaging) {
//     this.angularFireMessaging.messaging.subscribe((_messaging: any) => {
//       _messaging.onMessage = _messaging.onMessage.bind(_messaging);
//       _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
//     });
//   }
//   requestPermission() {
//     this.angularFireMessaging.requestToken.subscribe(
//       (token: any) => {
//         console.log(token);
//     },
//     (err: any) => {
//       console.error('Unable to get permission to notify.', err);
//     }
//   );
// }
// receiveMessage() {
//   this.angularFireMessaging.messages.subscribe((payload: any) => {
//     console.log('new message received. ', payload);
//     this.currentMessage.next(payload);
//   });
// }
// }
