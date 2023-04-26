import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CountryService {

  constructor(private http: HttpClient) {}


  initgetRequest(url:any) {
    return this.http.get(url);
  }

  initCountry(countryData: FormData | any) {
    if (!countryData) {    
      return;
    }
    return this.http.post<any>('http://localhost:3000/country', countryData);
  }

  initGetAllCountry(data?: any) {
    
    if (data) {
      return this.http.get<any>('http://localhost:3000/Countries', { params: data });
    } else {
      return this.http.get<any>('http://localhost:3000/Countries');
    }
  }
  initonlyCountry(){
    return this.http.get<any>('http://localhost:3000/country')
  }

  initDeleteCountry(id: any) {
    return this.http.delete('http://localhost:3000/country/' + id);
  }
}
