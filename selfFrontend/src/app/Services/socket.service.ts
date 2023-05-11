import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { io } from 'socket.io-client';
import { RunningreqComponent } from '../pages/runningreq/runningreq.component'

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: any;
  data: any;

  constructor() {
    this.socket = io('http://localhost:3000', {
      forceNew: true,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('connected');
    });

    this.socket.on('connect_error', (err: any) => {
      console.log(err);
    });
    // this.socket.on('toSendDriver', (data: any) => {
    //   console.log(data);
    // });
  }

  RunningReqData(): Observable<any> {
    return new Observable<any>((observer) => {
      observer.next(this.data);
    });
  }

  rideEmit(data: any) {
    this.socket.emit('ride', data);
  }  

  demo(){
    this.socket.on('toSendDriver', (data: any) => {
      console.log(data);
    });
  }
}
