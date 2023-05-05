import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RideService {
  constructor(private http: HttpClient) {}

  initGetAllZones(data?: any) {
    const Value = { Value: data };

    if (data) {
      return this.http.get<any>('http://localhost:3000/CityCountryZone', {
        params: Value,
      });
    } else {
      return this.http.get<any>('http://localhost:3000/CityCountryZone');
    }
  }

  initGetAllRides() {
    return this.http.get<any>('http://localhost:3000/Ride');
  }

  initGetLocationValidation(array: any) {
    return this.http.get<any>(
      `http://localhost:3000/CityCordinates?loc=${array}`
    );
  }

  initAddRideDetails(FormData: any) {
    return this.http.post<any>('http://localhost:3000/Ride', FormData);
  }

  initEditRide(id: any, FormData: any) {
    return this.http.patch<any>('http://localhost:3000/Ride/' + id, FormData);
  }
}
