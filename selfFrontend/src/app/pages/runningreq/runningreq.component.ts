import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RideService } from 'src/app/Services/ride.service';
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
  RideList: any;
  Interval: any;
  TimeOut:any = 10000;

  constructor(
    config: NgbModalConfig,
    private socketService: SocketService,
    private rideService: RideService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.socketService.socket.on('toSendDriver', (data: any) => {
      console.log(data);
      this.RideList.push(data.Ride);
      this.Interval = setTimeout(() => {
        this.CancelRide(data.Ride);
      }, this.TimeOut);
    });

    this.socketService.socket.on('ReqAcceptedByDriver', (data: any) => {     
      
      const ride = this.RideList.find((r: any) => r._id === data.Ride._id);
      
      ride.Driver = data.AssignDriver.DriverName;
      ride.Status = data.Ride.Status;
      console.log(ride);
    });
  }
  ngOnInit(): void {
    this.rideService.GetAllRides().subscribe({
      next: (data) => {
        this.RideList = data.filter((ride: any) => {
          return (
            ride.Status === 2 ||
            ride.Status === 3 ||
            ride.Status === 4 ||
            ride.Status === 100
          );
        });
      },
    });
  }

  open(content?: any) {
    this.staticBackdrop.nativeElement.classList.add('show');
    this.staticBackdrop.nativeElement.style.display = 'block';
  }
  closeModel() {
    this.Clicked = true;
    this.staticBackdrop.nativeElement.classList.remove('show');
    this.staticBackdrop.nativeElement.style.display = 'none';
  }

  initStatus(status: any) {
    return this.rideService.initGetStatus(status);
  }

  OnAccept(Ride: any) {
    this.socketService.socket.emit('DriverResponse', { Ride, Status: 1 });
    this.Clicked = true;
    if (this.Interval) {
      clearTimeout(this.Interval);
    }
  }

  CancelRide(Ride: any) {
    this.socketService.socket.emit('DriverResponse', { Ride, Status: 0 });
    this.RideList = this.RideList.filter((ride: any) => {
      console.log(ride._id, Ride._id);
      return ride._id !== Ride._id;
    });
    if (this.Interval) {
      clearTimeout(this.Interval);
    }
  }

  Oninformation(Ride: any) {
    console.log(Ride);
  }
}
