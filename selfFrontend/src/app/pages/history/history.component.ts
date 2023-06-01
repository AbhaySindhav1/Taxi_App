import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RideService } from 'src/app/Services/ride.service';
import { RideDetailComponent } from 'src/app/popup/ride-detail/ride-detail.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  RideList: any;
  limit: any = 10;
  page: any = 1;
  totalRides: any;
  constructor(private rideService: RideService, public dialog: MatDialog) {}
  ngOnInit(): void {
    this.GetRideHistory();
  }

  Oninformation(Ride: any) {
    console.log(Ride);
  }

  GetRideHistory(event?: any) {
    this.page = event ? event : this.page;

    this.rideService.GetAllRides().subscribe({
      next: (data) => {
        this.RideList = data.filter((ride: any) => {
          return ride.Status === 0 || ride.Status === 5;
        });
        this.totalRides = this.RideList.length;
      },
    });
  }

  openDialog(Ride: any) {
    Ride.Map = true;

    const dialogRef = this.dialog.open(RideDetailComponent, {
      data: Ride,
    });
  }
}
