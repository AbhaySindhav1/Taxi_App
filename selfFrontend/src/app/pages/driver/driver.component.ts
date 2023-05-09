import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CityService } from 'src/app/Services/city.service';
import { DriverService } from 'src/app/Services/driver.service';
import { Renderer2 } from '@angular/core';
import { createPopper } from '@popperjs/core';

import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { CountryService } from 'src/app/Services/country.service';
import { VehicleService } from 'src/app/Services/vehicle.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css'],
})
export class DriverComponent implements OnInit {
  isSearchMode = false;
  DriverForm: FormGroup | any;
  selectedFile: any;
  isSubmitted = false;
  isEditMode = false;
  displayerror = false;
  error: any;
  DriverData: any;
  DriverId: any;
  CityList: any;
  value = false;
  istoggled = false;
  showClass = false;
 driver:any
 CountryList:any
 VehicleList:any

  constructor(
    private driverService: DriverService,
    private cityService: CityService,
    private renderer: Renderer2,
    private elRef: ElementRef,
    private countryService: CountryService,
    private vehicleService: VehicleService,
  ) {
    this.DriverForm = new FormGroup({
      DriverFile: new FormControl(null),
      DriverName: new FormControl(null, [Validators.required]),
      DriverEmail: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      CountryCode: new FormControl(null, [Validators.required]),
      DriverPhone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^((\\+91-?)|0)?[0-9\\s-]{10}$'),
      ]),
      DriverCity: new FormControl('', [Validators.required]),
      DriverCountry: new FormControl('', [Validators.required]),
      ServiceType: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.getDriverReq();

    // this.cityService.initGetAllCountry().subscribe({
    //   next: (data) => {
    //     this.CityList = data;
    //     if (this.CityList.length > 0) {
    //       this.DriverForm.get('DriverCity')?.setValue(this.CityList[0]);
    //     }
    //   },
    //   error: (error) => {
    //     this.error = error;
    //     this.displayerror = true;
    //   },
    // });

    this.vehicleService.initGetTypesOfVehicles().subscribe({
      next: (data) => {
        this.VehicleList = data;
        console.log(this.VehicleList);
        
      },
      error: (error) => {
        this.error = error;
        this.displayerror = true;
      },
    });
    this.countryService.initonlyCountry().subscribe({
      next: (data) => {
        this.CountryList = (data.sort());
      
      },
    });
  }

  ///   country change


  onCountrySelect() {
    this.error = null;
    this.DriverForm.get('city')?.setValue('');
    let value = (document.getElementById("DriverCountry")as HTMLSelectElement).value;

    this.cityService.initGetAllCountry(value).subscribe({
      next: (data) => {
        this.CityList = data;
        console.log(this.CityList);
        
        // Update the value of the city form control to the first item in the list
        if (this.CityList.length > 0) {
          this.DriverForm.get('DriverCity')?.setValue(this.CityList[0]);
        }
      },
      error: (error) => {
        this.error = error;
        this.displayerror = true;
      },
    });
  }

  /// when form Submitted

  onFormSubmit() {
    console.log(this.DriverForm.value);
    
    this.isSubmitted = true;

    if (!this.DriverForm.valid) {
      return;
    }
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('profile', this.selectedFile);
    }
    formData.append('DriverName', this.DriverForm.get('DriverName').value);
    formData.append('DriverEmail', this.DriverForm.get('DriverEmail').value);
    formData.append('CountryCode', this.DriverForm.get('CountryCode').value);
    formData.append('DriverPhone', this.DriverForm.get('DriverPhone').value);
    formData.append('DriverCity', this.DriverForm.get('DriverCity').value);
    formData.append('DriverCountry', this.DriverForm.get('DriverCountry').value);
    formData.append('ServiceType', this.DriverForm.get('ServiceType').value);

    if (!this.isEditMode) {
      this.driverService.initDriver(formData).subscribe({
        next: (data) => {
          this.getDriverReq();
          this.initReset();
        },
        error: (error) => {
          console.log(error);

          if (error.error && error.error.sizeError) {
            this.error = error.error.sizeError;
          } else if (error.error && error.error.fileError) {
            this.error = error.error.fileError;
          } else {
            this.error = error.error;
          }
          this.displayerror = true;
        },
      });
    } else {
      this.driverService.initEditDriver(this.DriverId, formData).subscribe({
        next: (data) => {
          this.getDriverReq();
          this.initReset();
        },
        error: (error) => {
          console.log(error);

          if (error.error && error.error.sizeError) {
            this.error = error.error.sizeError;
          } else if (error.error && error.error.fileError) {
            this.error = error.error.fileError;
          } else {
            this.error = error.error;
          }
          this.displayerror = true;
        },
      });
    }
  }

  ///  for search driver

  onSearch() {
    this.isSearchMode = !this.isSearchMode;
    this.getDriverReq();
  }

  ///  when  file upload

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  /// for error handling  to get  controls status

  get f() {
    return this.DriverForm.controls;
  }

  ////  search Driver Details

  onSearchDriver(SortColomb?: any) {
    let searchValue;

    if (!(document.getElementById('searchBtn') as HTMLInputElement)) {
      searchValue = '';
    } else {
      searchValue = (document.getElementById('searchBtn') as HTMLInputElement)
        .value;
    }

    this.driverService.initGetDriver(searchValue, SortColomb).subscribe({
      next: (data) => {
        this.DriverData = data;
        this.initReset();
      },
      error: (error) => {
        console.log(error);

        this.error = error;
        this.displayerror = true;
      },
    });
  }

  ////  Edit Driver Info

  onEditDriver(Driver: any) {
    console.log(Driver);
    
    this.isEditMode = true;
    this.DriverId = Driver._id;
    const a = Driver.DriverPhone.split('-');

    this.DriverForm.patchValue({
      DriverName: Driver.DriverName,
      DriverEmail: Driver.DriverEmail,
      CountryCode: +a[0],
      DriverPhone: +a[1],
      DriverCountry: Driver.DriverCountry,
      DriverCity: Driver.DriverCity,
      ServiceType: Driver.ServiceType,
    });
    this.onCountrySelect()
  }

  ////  Delete  Driver Info

  onDeleteDriver(id: any) {
    this.driverService.initDeleteDriver(id).subscribe({
      next: (data) => {
        this.getDriverReq();
        this.initReset();
      },
      error: (error) => {
        this.error = error.error;
        this.displayerror = true;
      },
    });
  }

  ///  to reset everyThing

  initReset() {
    // this.isSearchMode = false;
    this.selectedFile = null;
    this.isSubmitted = false;
    this.isEditMode = false;
    this.DriverId = null;
    this.error = null;
    this.istoggled = false;
    this.displayerror = false;
    this.DriverForm.reset();
  }

  getDriverReq() {
    this.driverService.initGetDriver().subscribe({
      next: (data) => {
        this.DriverData = data;
        this.initReset();
      },
      error: (error) => {
        console.log(error);

        this.error = error;
        this.displayerror = true;
      },
    });
  }

  onStatusUpdate(id: any, data: any) {
    this.DriverId = id;
    let formData = new FormData();
    formData.append('approval', data);
    this.driverService.initEditDriver(id, formData).subscribe({
      next: (data) => {
        this.getDriverReq();
        this.initReset();
      },
      error: (error) => {
        console.log(error);

        if (error.error && error.error.sizeError) {
          this.error = error.error.sizeError;
        } else if (error.error && error.error.fileError) {
          this.error = error.error.fileError;
        } else {
          this.error = error.error;
        }
        this.displayerror = true;
      },
    });
  }

  getImageSource(driver:any) {
    return driver.profile ? `http://localhost:3000/uploads/Drivers/${driver.profile}` : 'http://localhost:3000/uploads/nouser.png';
  }
}
