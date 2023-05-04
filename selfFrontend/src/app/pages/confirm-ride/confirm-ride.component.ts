import { Component, OnInit } from '@angular/core';
import { RideService } from 'src/app/Services/ride.service';

@Component({
  selector: 'app-confirm-ride',
  templateUrl: './confirm-ride.component.html',
  styleUrls: ['./confirm-ride.component.css'],
})
export class ConfirmRideComponent implements OnInit {

  RideList:any;

  constructor(private rideService: RideService) {}

  ngOnInit(): void {
    this.rideService.initGetAllRides().subscribe({
      next: (data) => {
        console.log(data[0].Stops.split('","').length);
        
        
        this.rideService
        this.RideList =data ;
        // console.log((this.RideList[0].Stops[0].length));
        
      },
    });
  }

  OnAssign(){}

  onCencel(){}
}
