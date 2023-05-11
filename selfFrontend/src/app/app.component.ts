import { Component, OnInit } from '@angular/core';
import { SocketService } from './Services/socket.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'MainTask';

  constructor(private socketService : SocketService) {
  
  }
  ngOnInit(): void {
    
  }
}
