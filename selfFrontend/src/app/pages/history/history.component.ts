import { Component, OnInit } from '@angular/core';
import { RideService } from 'src/app/Services/ride.service';

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
  constructor(private rideService: RideService) {}
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
}
