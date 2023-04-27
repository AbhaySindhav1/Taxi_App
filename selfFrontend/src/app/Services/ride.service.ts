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
      [0];
      return this.http.get<any>('http://localhost:3000/CityCountryZone');
    }
  }

  initGetLocationValidation(array:any){
    return this.http.get<any>(`http://localhost:3000/CityCordinates?loc=${array}`)
  }
}
