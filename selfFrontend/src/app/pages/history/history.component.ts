import { Component, OnInit } from '@angular/core';
import { RideService } from 'src/app/Services/ride.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  RideList: any;
  constructor(private rideService: RideService) {}
  ngOnInit(): void {
    this.rideService.GetAllRides().subscribe({
      next: (data) => {
        this.RideList = data.filter((ride: any) => {
          return ride.Status === 0 || ride.Status === 5 ;
        });
        
      },
    });
  }

  Oninformation(Ride: any) {
    console.log(Ride);
  }
}
