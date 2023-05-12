import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SocketService } from 'src/app/Services/socket.service';
@Component({
  selector: 'app-runningreq',
  templateUrl: './runningreq.component.html',
  styleUrls: ['./runningreq.component.css'],
  providers: [NgbModalConfig, NgbModal],
})
export class RunningreqComponent implements OnInit {
  @ViewChild('staticBackdrop', { static: false }) staticBackdrop: any;

  Trip: any = {};
  Clicked = false;

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private socketService: SocketService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.socketService.socket.on('toSendDriver', (data: any) => {
      console.log('data');
      this.Trip = data.data.ride;
      console.log(data);
      let Interval = setTimeout(() => {
        if (this.Clicked) return;
        this.initResponse('Declined', this.Trip._id);
        this.closeModel()
      }, 10000);
      this.open();
    });
    this.socketService.socket.on('AssignedReqAccepted', (data: any) => {});
  }
  ngOnInit(): void {}

  open(content?: any) {
    this.staticBackdrop.nativeElement.classList.add('show');
    this.staticBackdrop.nativeElement.style.display = 'block';
  }
  closeModel() {
    this.Clicked = true;
    this.staticBackdrop.nativeElement.classList.remove('show');
    this.staticBackdrop.nativeElement.style.display = 'none';
  }

  initResponse(response: string, id: any) {
    this.socketService.socket.emit('DriverResponse', { response, id });
  }

  initStatus() {}
}
