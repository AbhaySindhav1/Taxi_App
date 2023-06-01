import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DriverService } from 'src/app/Services/driver.service';
import { RideService } from 'src/app/Services/ride.service';
import { SocketService } from 'src/app/Services/socket.service';
import { VehicleService } from 'src/app/Services/vehicle.service';
import { RideDetailComponent } from 'src/app/popup/ride-detail/ride-detail.component';

@Component({
  selector: 'app-confirm-ride',
  templateUrl: './confirm-ride.component.html',
  styleUrls: ['./confirm-ride.component.css'],
})
export class ConfirmRideComponent implements OnInit {
  RideList: any;
  Status: any;
  VehicleList: any;
  Vehicle: any;
  RideSearchForm: any;
  driverData: any;
  Ride: any = {};
  selectedRowIndex?: any;
  SelectedRow: any;
  limit: any = 10;
  page: any = 1;
  totalRides: any;

  constructor(
    private rideService: RideService,
    private vehicleService: VehicleService,
    private toastr: ToastrService,
    private driverService: DriverService,
    private socketService: SocketService,
    public dialog: MatDialog
  ) {
    this.OnAssign = this.OnAssign.bind(this);
    this.RideSearchForm = new FormGroup({
      Status: new FormControl(null),
      Type: new FormControl(null),
      FromDate: new FormControl(null),
      toDate: new FormControl(null),
      Search: new FormControl(null),
    });

    this.socketService.socket.on('reqtoSendDriver', (data: any) => {
      this.initRideDataChange(
        data.ride._id,
        data.ride.Status,
        data.ride.DriverId,
        data.ride.Driver
      );
    });
    this.socketService.socket.on('NotReactedRide', (data: any) => {
      this.initRideDataChange(
        data.ride._id,
        data.ride.Status,
        data.ride.DriverId,
        data.ride.Driver
      );
    });

    this.socketService.socket.on('CancelledRide', (data: any) => {
      this.RideList = this.RideList.filter((ride: any) => {
        return ride._id !== data.Ride.RideId;
      });
    });

    this.socketService.socket.on('ReqAcceptedByDriver', (data: any) => {
      this.RideList = this.RideList.filter((ride: any) => {
        return ride._id !== data[0]._id;
      });
    });
  }

  ngOnInit(): void {
    this.vehicleService.initGetTypesOfVehicles().subscribe({
      next: (data) => {
        this.VehicleList = data;
      },
      error: (error) => {
        this.toastr.error(error.errors);
      },
    });
    this.GetAllData();
  }

  OnAssign(Ride: any) {
    let formdata = new FormData();
    formdata.append('ServiceType', Ride.type);
    formdata.append('RideCity', Ride.RideCity);

    this.driverService.initSpeceficDrivers(formdata).subscribe({
      next: (data) => {
        this.driverData = data;
      },
      error: (error) => {
        this.toastr.error(error);
      },
    });
    this.Ride = Ride;
    this.selectedRowIndex = null;
    this.SelectedRow = null;
  }

  CancelRide(Ride: any, Status?: any) {
    if (Status == 0) {
      let Confirm = confirm('Are You Want Cancel Ride');
      if (!Confirm) return;

      console.log(Ride);

      this.socketService.socket.emit('ride', {
        rideID: Ride._id,
        Status: Status,
        driverID: Ride.DriverId,
      });
    }
  }

  AssignDriver(ride: any, Status?: any) {
    console.log(ride);
    if (!ride) return;
    this.socketService.socket.emit('ride', {
      rideID: ride._id,
      driverID: this.SelectedRow._id,
      Status: Status,
    });
  }

  getTrData(index: any, row: any) {
    this.selectedRowIndex = index;
    this.SelectedRow = row;
  }

  initRideDataChange(
    rideID: any,
    RideStatus: any,
    RideDriverId: any,
    RideDriver: any
  ) {
    if (!rideID) return;
    const ride = this.RideList.find((r: any) => r._id === rideID);
    ride.Status = RideStatus;
    ride.DriverId = RideDriverId;
    ride.Driver = RideDriver;
  }

  ////////////////////////////////////////////////////////////    Get  Filter  Rides      /////////////////////////////////////////////////////////////////////

  Filter() {
    let form = new FormData();

    form.append('Search', this.RideSearchForm.get('Search').value);
    form.append('Type', this.RideSearchForm.get('Type').value);
    form.append('FromDate', this.RideSearchForm.get('FromDate').value);
    form.append('toDate', this.RideSearchForm.get('toDate').value);
    form.append('Status', this.RideSearchForm.get('Status').value);

    this.rideService.initFilterRide(form).subscribe({
      next: (data) => {
        this.RideList = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  ////////////////////////////////////////////////////////////    Get   All  Rides      /////////////////////////////////////////////////////////////////////

  GetAllData(event?: any) {
    this.rideService.initGetAllRides().subscribe({
      next: (data) => {
        data.forEach((element: any) => {
          element.Stops = JSON.parse(element.Stops);
        });
        this.RideList = data.filter((ride: any) => {
          return ride.Status === 1 || ride.Status === 2 || ride.Status === 100;
        });
        this.totalRides = this.RideList.length;
        this.RideList = data;
      },
    });
  }

  ////////////////////////////////////////////////////////////    Get  Rides  Details     /////////////////////////////////////////////////////////////////////
  openDialog(Ride: any) {
    const dialogRef = this.dialog.open(RideDetailComponent, {
      data: Ride,
    });
  }
}
