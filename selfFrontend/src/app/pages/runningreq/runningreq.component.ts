import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RideService } from 'src/app/Services/ride.service';
import { SocketService } from 'src/app/Services/socket.service';
import { RideDetailComponent } from 'src/app/popup/ride-detail/ride-detail.component';
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
  timeoutValue: any = 10000;
  limit: any = 10;
  page: any = 1;
  totalRides: any;

  constructor(
    config: NgbModalConfig,
    private socketService: SocketService,
    private rideService: RideService,
    public dialog: MatDialog
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    this.socketService.socket.on('reqtoSendDriver', (data: any) => {
      this.initChange(data);
    });

    this.socketService.socket.on('RejectRide', (data: any) => {
      this.initChange(data?.ride);
    });

    this.socketService.socket.on('ReqAcceptedByDriver', (data: any) => {
      console.log(data);
      this.RideList = this.RideList.filter((ride: any) => {
        return ride._id !== data._id;
      });
    });

    this.socketService.socket.on('noDriverFound', (data: any) => {
      this.RideList = this.RideList.filter((ride: any) => {
        return ride._id !== data.ride._id;
      });
    });

    this.socketService.socket.on('NotReactedRide', (data: any) => {
      this.initRideDataChange(
        data.rides._id,
        data.rides.Status,
        data.rides.DriverId,
        data.rides.Driver
      );
    });

    this.socketService.socket.on('CancelledRide', (data: any) => {
      this.CancelRide(data.Ride);
    });
  }

  ngOnInit(): void {
    this.GetRides();
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
    this.RideList = this.RideList.filter((ride: any) => {
      return ride._id !== Ride._id;
    });
  }

  RejectRide(Ride: any) {
    this.socketService.socket.emit('DriverResponse', { Ride, Status: 0 });
  }

  GetRides(event?: any) {
    if (this.totalRides < this.limit * this.page) {
      this.page = 1;
    }
    let data = {
      limit: +this.limit,
      page: event ? event : this.page,
      status: [100],
    };

    this.page = event ? event : this.page;

    this.rideService.initGetAllRides(data).subscribe({
      next: (data) => {
        console.log(data);

        this.RideList = data.Rides;
        this.totalRides = data.totalRide;
      },
    });
  }

  initRideDataChange(
    rideID: any,
    RideStatus: any,
    RideDriverId: any,
    RideDriver: any
  ) {
    if (!rideID) return;
    const ride = this.RideList.find((r: any) => r._id === rideID);
    if (RideStatus) {
      ride.Status = RideStatus;
    }
    ride.DriverId = RideDriverId;
    ride.Driver = RideDriver;
  }

  initStatus(status: any) {
    return this.rideService.initGetStatus(status);
  }

  openDialog(Ride: any) {
    const dialogRef = this.dialog.open(RideDetailComponent, {
      data: Ride,
    });
  }

  initChange(data: any) {
    const index = this.RideList.findIndex((ride: any) => ride._id === data._id);
    if (index !== -1) {
      this.RideList[index] = data;
    } else {
      this.RideList.push(data);
    }
  }

  open(content?: any) {
    this.staticBackdrop.nativeElement.classList.add('show');
    this.staticBackdrop.nativeElement.style.display = 'block';
  }
  closeModel() {
    this.staticBackdrop.nativeElement.classList.remove('show');
    this.staticBackdrop.nativeElement.style.display = 'none';
  }
}
