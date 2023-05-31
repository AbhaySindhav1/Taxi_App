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
  RideList: any;
  Interval: any;
  TimeOut: any = 10000;
  limit: any = 10;
  page: any = 1;
  totalRides: any ;

  constructor(
    config: NgbModalConfig,
    private socketService: SocketService,
    private rideService: RideService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    this.socketService.socket.on('reqtoSendDriver', (data: any) => {
      this.RideList.push(data.ride);
      this.Interval = setTimeout(() => {
        this.OnNotReactedByDriver(data.ride);
      }, this.TimeOut);
    });

    this.socketService.socket.on('ReqAcceptedByDriver', (data: any) => {
      console.log(data);
      
      const ride = this.RideList.find((r: any) => r._id === data[0]._id);
      ride.Driver = data[0].DriverInfo.DriverName;
      ride.Status = data[0].Status;
    });

    this.socketService.socket.on('CancelledRide', (data: any) => {
      this.RideList = this.RideList.filter((ride: any) => {
        return ride._id !== data.Ride.RideId;
      });
    });
  }
  ngOnInit(): void {
    this.GetRides()
  }

  GetRides(event?:any) {
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
        this.totalRides =  this.RideList.length
      },
    });
  }

  open(content?: any) {
    this.staticBackdrop.nativeElement.classList.add('show');
    this.staticBackdrop.nativeElement.style.display = 'block';
  }
  closeModel() {
    this.staticBackdrop.nativeElement.classList.remove('show');
    this.staticBackdrop.nativeElement.style.display = 'none';
  }

  initStatus(status: any) {
    return this.rideService.initGetStatus(status);
  }

  OnAccept(Ride: any) {
    this.socketService.socket.emit('DriverResponse', { Ride, Status: 2 });
    if (this.Interval) {
      clearTimeout(this.Interval);
    }
  }

  OnNotReactedByDriver(Ride: any) {
    this.socketService.socket.emit('DriverResponse', { Ride, Status: 1 });
    this.RideList = this.RideList.filter((ride: any) => {
      return ride._id !== Ride._id;
    });
    if (this.Interval) {
      clearTimeout(this.Interval);
    }
  }

  CancelRide(Ride: any) {
    this.socketService.socket.emit('DriverResponse', { Ride, Status: 0 });
    this.RideList = this.RideList.filter((ride: any) => {
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
