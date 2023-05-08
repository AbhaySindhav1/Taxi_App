import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public socket: any;

  constructor() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('connected at frontend site');
    });

    this.socket.on('connect_error', (err: any) => {
      console.log(err);
    });
  }

  // Other methods and functions using the socket can go here
}
