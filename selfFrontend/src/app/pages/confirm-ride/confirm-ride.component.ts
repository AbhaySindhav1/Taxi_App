import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DriverService } from 'src/app/Services/driver.service';
import { RideService } from 'src/app/Services/ride.service';
import { SocketService } from 'src/app/Services/socket.service';
import { VehicleService } from 'src/app/Services/vehicle.service';

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

  constructor(
    private rideService: RideService,
    private vehicleService: VehicleService,
    private toastr: ToastrService,
    private driverService: DriverService,
    private socketService: SocketService
  ) {
    this.OnAssign = this.OnAssign.bind(this);
    this.RideSearchForm = new FormGroup({
      Status: new FormControl(null),
      Type: new FormControl(null),
      FromDate: new FormControl(null),
      toDate: new FormControl(null),
      Search: new FormControl(null),
    });

    this.socketService.socket.on('AssignedReqDeclined', (data: any) => {
      this.onDeclinedReq(data);
    });
    this.socketService.socket.on('toSendDriver', (data: any) => {
      const ride = this.RideList.find((r: any) => r._id === data.Ride._id);
      ride.Driver = data.AssignDriver.DriverName;
    });
    this.socketService.socket.on('CancelledRide', (data: any) => {
      this.RideList = this.RideList.filter((ride: any) => {
        console.log(data.Ride.RideId);
        return ride._id !== data.Ride.RideId;
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
    console.log(Ride);
    let formdata = new FormData();
    formdata.append('ServiceType', Ride.type);

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
    this.SelectedRow = {};
  }

  CancelRide(Ride: any, Status?: any) {
    if (Status == 0) {
      let Confirm = confirm('Are You Want Cancel Ride');
      if (!Confirm) return;

      this.socketService.socket.emit('ride', {
        ride: Ride,
        Status: Status,
      });
    }
  }

  AssignDriver(ride: any, Status?: any) {
    console.log(this.SelectedRow, ride, Status);

    this.socketService.socket.emit('ride', {
      ride: ride,
      driver: this.SelectedRow._id,
      Status: Status,
    });
  }

  getTrData(index: any, row: any) {
    this.selectedRowIndex = index;
    this.SelectedRow = row;
  }

  onDeclinedReq(data: any) {
    if (!data) return;
    const ride = this.RideList.find((r: any) => r._id === data.id);
    ride.Status = data.Status;
    ride.Driver = data.Driver;
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

  GetAllData() {
    this.rideService.initGetAllRides().subscribe({
      next: (data) => {
        this.RideList = data;
      },
    });
  }
}
