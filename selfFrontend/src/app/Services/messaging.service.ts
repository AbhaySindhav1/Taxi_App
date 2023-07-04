import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  currentMessage = new BehaviorSubject<any>(null);
  constructor(private afm: AngularFireMessaging, private http: HttpClient) {}

  requestPermission() {
    this.afm.requestToken.subscribe({
      next: (Permission) => {
        console.log('Permission', Permission);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  PrepareMessaging() {
    this.afm.messages.subscribe({
      next: (payload: any) => {
        const notificationTitle = payload.notification?.title;

        const notificationOptions = {
          body: payload.notification.body,
          icon: '../../assets/images/nouser.png',
          vibrate: [200, 100, 200],
          sound: '../../assets/Sound/notification.wav',
        };

        new Notification(notificationTitle, notificationOptions);
        this.currentMessage.next(payload);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getToken(msg: any) {
    this.afm.getToken.subscribe({
      next: (token: any) => {
        this.sendNotification(token, msg);
      },
      error: (error) => {
        console.error('error', error);
      },
    });
  }

  sendNotification(deviceToken: string, msg: any): void {
    const notification = {
      notification: {
        title: 'Reassign Rides',
        body: { count: msg, Alert: 'Driver Not Found' },
        sound: '../../assets/Sound/notification.wav',
      },
      to: deviceToken,
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization:
          'key=AAAA_gURmFo:APA91bEC_6XT-oCVChnDk6psqgkhxRVOq8tIdBURXpsbhJ9Ffkiz6HuIzc38dAveAqjINmQRiP_MspqZZMEhc6YLfsUKjk2enlVJ883icMEdBAlVOQuoJ8OohutIoHT4EKabz8WIN_xL',
      }),
    };

    this.http
      .post('https://fcm.googleapis.com/fcm/send', notification, httpOptions)
      .subscribe({
        next: (data: any) => {
          console.log('notification result', data);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
}
