import {  Routes } from '@angular/router';
import { TableComponent } from '../pages/table/table.component';
import { CountryComponent } from '../pages/country/country.component';
import { CityComponent } from '../pages/city/city.component';
import { PricingComponent } from '../pages/pricing/pricing.component';
import { UsersComponent } from '../pages/users/users.component';
import { DriverComponent } from '../pages/driver/driver.component';

export const DashBoardRoutes: Routes = [
  { path: 'table', component: TableComponent },
  { path: 'country', component: CountryComponent },
  { path: 'city', component: CityComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'users', component: UsersComponent },
  { path: 'driver', component: DriverComponent },
];

export class AppRoutingModule {}
