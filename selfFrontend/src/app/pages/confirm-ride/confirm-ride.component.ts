import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DriverService } from 'src/app/Services/driver.service';
import { RideService } from 'src/app/Services/ride.service';
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

  constructor(
    private rideService: RideService,
    private vehicleService: VehicleService,
    private toastr: ToastrService,
    private driverService: DriverService
  ) {
    this.OnAssign = this.OnAssign.bind(this);
    this.RideSearchForm = new FormGroup({
      Status: new FormControl(''),
      Type: new FormControl(''),
      FromDate: new FormControl(null),
      toDate: new FormControl(null),
      Search: new FormControl(null),
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

    this.driverService.initGetDriver().subscribe({
      next: (data) => {
        this.driverData = data;
      },
      error: (error) => {
        this.toastr.error(error);
      },
    });
  }

  OnAssign(Ride: any) {
    console.log(Ride);

    this.Ride = Ride;
  }

  StatusChange(id: any, Status?: any) {
    let Confirm = confirm('Are You Want Cancel Ride');
    if (!Confirm) return;
    let formdata = new FormData();
    formdata.append('Status', Status);
    this.rideService.initEditRide(id, formdata).subscribe({
      next: (data) => {
        if (data !== 'updated') {
        }
        const ride = this.RideList.find((r: any) => r._id === id);
        if (ride) {
          ride.Status = Status;
        }
      },
    });
  }

  GetAllData() {
    this.rideService.initGetAllRides().subscribe({
      next: (data) => {
        this.rideService;
        this.RideList = data;
      },
    });
  }
}
