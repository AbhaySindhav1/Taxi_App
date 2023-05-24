import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  initUsers(formData: any) {
    return this.http.post<any>('http://localhost:3000/MyUser', formData);
  }

  onDeleteCard(data: any) {
    console.log(data);

    return this.http.post<any>(
      'http://localhost:3000/StripeInt/delete/' + data,
      data
    );
  }

  initGetUsers(data?: any, sortData?: any) {
    const Value = { Value: data || '' };
    const sort = { sortValue: sortData || '' };

    return this.http.get<any>('http://localhost:3000/MyUser', {
      params: { ...Value, ...sort },
    });
  }

  initDeleteUsers(id: any) {
    return this.http.delete('http://localhost:3000/MyUser/' + id);
  }

  initEditUsers(id: any, data: any) {
    return this.http.patch('http://localhost:3000/MyUser/' + id, data);
  }
}
