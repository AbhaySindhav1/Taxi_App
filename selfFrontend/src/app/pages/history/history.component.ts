import { Component, OnInit } from '@angular/core';
import { RideService } from 'src/app/Services/ride.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  constructor(private rideService: RideService) {}
  ngOnInit(): void {
    this.rideService.initRideHistory().subscribe({
      next: (data) => {
        console.log(data);
      },
    });
  }
}
