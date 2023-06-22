// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// // import { AngularFireMessaging } from '@angular/fire/messaging';

// @Injectable({
//   providedIn: 'root',
// })
// export class MessagingService {
//   currentMessage = new BehaviorSubject<any>(null);
//   constructor(private firebaseMessaging: AngularFireMessaging) {}

//   reqForPermission() {
//     this.firebaseMessaging.requestToken.subscribe({
//       next: (token) => {
//         console.log(token);
//       },
//       error: (error) => {
//         console.log('unable to get permisson', error);
//       },
//     });
//   }

//   receiveMessaging() {
//     this.firebaseMessaging.messages.subscribe({
//       next: (payload) => {
//         console.log('new message received', payload);
//         this.currentMessage.next(payload);
//       },
//       error: (error) => {
//         console.log('unable to get permisson', error);
//       },
//     });
//   }
// }
