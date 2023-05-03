import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RideService } from 'src/app/Services/ride.service';
import { UsersService } from 'src/app/Services/users.service';
import { PricingService } from 'src/app/Services/pricing.service';

declare var google: any;
let directionsRenderer = new google.maps.DirectionsRenderer();
let directionsService = new google.maps.DirectionsService();
@Component({
  selector: 'app-create-ride',
  templateUrl: './create-ride.component.html',
  styleUrls: ['./create-ride.component.css'],
})
export class CreateRideComponent implements OnInit {
  [x: string]: any;
  phoneNumber: any;
  Vehicles: any = [];
  user: any = null;
  stops: any = [];
  RideForm: FormGroup | any;
  RideDetailsForm: FormGroup | any;
  map: google.maps.Map | any;
  isSubmitted = false;
  isServiceAvailable = false;
  isServiceZone: any = null;
  error = false;
  errMassage: any;
  Distance: any;
  Time: any;
  allPlaces: any = {};
  tripDetails: any = {};
  RideDetailsFormShow = false;
  wayPoints: any = [];

  constructor(
    private usersService: UsersService,
    private rideService: RideService,
    private toastr: ToastrService,
    private pricingService: PricingService
  ) {
    this.RideForm = new FormGroup({
      UserPhone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^((\\+91-?)|0)?[0-9\\s-]{10}$'),
      ]),
      UserName: new FormControl(null, [Validators.required]),
      CountryCode: new FormControl(+91, [Validators.required]),
      UserEmail: new FormControl(null, [Validators.required, Validators.email]),
    });

    this.RideDetailsForm = new FormGroup({
      PickupPoint: new FormControl(null, [Validators.required]),
      DropPoint: new FormControl(null, [Validators.required]),
      VehicleSelector: new FormControl('', [Validators.required]),
      Time: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.initMap();
    this.setupAutocomplete('PickupPoint');
    this.setupAutocomplete('DropPoint');
  }

  onInput(e: any) {
    if (e.value.length === 10) {
      e.value = e.value.substring(0, 10);
      const number =
        '+' +
        +(document.getElementById('CountryCode') as HTMLInputElement).value +
        '-' +
        e.value;

      this.usersService.initGetUsers(number).subscribe({
        next: (data) => {
          if (data.length === 0) {
            return;
          } else {
            if (data[0]) {
              this.user = data[0];
            }
            this.RideForm.patchValue({
              UserName: data[0].UserName,
              UserEmail: data[0].UserEmail,
            });
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  initMap(lat = 23, lng = 73, zoom = 7) {
    let loc = { lat: +lat, lng: +lng };

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: loc,
      zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });
  }

  get f() {
    return this.RideForm.controls;
  }
  get d() {
    return this.RideDetailsForm.controls;
  }

  onAddStop() {
    const newStopIndex = this.stops.length + 1;

    this.RideDetailsForm.addControl(
      `Drop${newStopIndex}`,
      new FormControl(null, [Validators.required])
    );
    this.RideDetailsForm.controls[
      `Drop${newStopIndex}`
    ].updateValueAndValidity();

    if (this.stops.length >= 2) {
      return;
    }

    this.stops.push(`Drop${newStopIndex}`);

    setTimeout(() => {
      const inputElement = document.getElementById(`Drop${newStopIndex}`);
      if (inputElement instanceof HTMLInputElement) {
        this.setupAutocomplete(inputElement.id);
      }
    }, 1);
  }

  OnRideFormSubmit() {
    this.isSubmitted = true;
    this.errMassage = null;
    if (!this.RideForm.valid) return;
    let formData = new FormData();

    formData.append('UserName', this.RideForm.get('UserName').value);
    formData.append('UserEmail', this.RideForm.get('UserEmail').value);
    formData.append('CountryCode', this.RideForm.get('CountryCode').value);
    formData.append('UserPhone', this.RideForm.get('UserPhone').value);
    if (!this.user) {
      this.usersService.initUsers(formData).subscribe({
        next: (data) => {
          this.RideDetailsFormShow = true;
          this.isSubmitted = false;
          this.error = false;
          setTimeout(() => {
            this.setupAutocomplete('PickupPoint');
            this.setupAutocomplete('DropPoint');
          }, 1);
        },
        error: (error) => {
          this.errMassage = error.error;
          this.error = true;
          return;
        },
      });
    } else {
      this.RideDetailsFormShow = true;
      this.isSubmitted = false;
      this.error = false;
      setTimeout(() => {
        this.setupAutocomplete('PickupPoint');
        this.setupAutocomplete('DropPoint');
      }, 1);
    }
  }

  setupAutocomplete(fieldName: string) {
    const autocomplete = new google.maps.places.Autocomplete(
      document.getElementById(fieldName),
      {
        types: [],
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place: google.maps.places.PlaceResult = autocomplete.getPlace();
      if (place.geometry === undefined || place.geometry === null) {
        return;
      }

      this.RideForm.get(fieldName)?.setValue(
        (document.getElementById(fieldName) as HTMLInputElement).value
      );

      let lat = place.geometry.location?.lat();
      let lng = place.geometry.location?.lng();

      const location = [lng, lat];
      if (`${fieldName}` === 'PickupPoint') {
        this.rideService.initGetLocationValidation(location).subscribe({
          next: (data) => {
            if (data.length === 0) {
              this.toastr.error('For This Location Service is Unavailable');
              (
                document.getElementById(`${fieldName}`) as HTMLInputElement
              ).value = '';
              (
                document.getElementById(`${fieldName}`) as HTMLInputElement
              ).focus();
              return;
            } else {
              console.log(data);
              this.isServiceZone = data[0];
              this.pricingService
                .initGetAllVehicle(this.isServiceZone.city)
                .subscribe({
                  next: (data) => {
                    this.Vehicles = data;
                  },
                  error: (error) => {
                    console.log(error);
                    this.errMassage = error;
                    this.error = true;
                  },
                });
            }
          },

          error: (error) => {
            console.log(error);
            this.errMassage = error;
            this.error = true;
          },
        });
      }

      this.initDirection();
    });
  }

  removeDrop(Id: any) {
    this.RideDetailsForm.removeControl(Id);
    this.stops.pop(Id);
    this.initDirection();
  }

  initDirection() {
    this.wayPoints = [];
    for (let index = 1; index <= this.stops.length; index++) {
      this.wayPoints.push({
        location: (document.getElementById(`Drop${index}`) as HTMLInputElement)
          .value,
        stopover: true,
      });
    }

    directionsRenderer.setMap(this.map);
    if (
      !(document.getElementById('PickupPoint') as HTMLInputElement).value ||
      !(document.getElementById('DropPoint') as HTMLInputElement).value
    ) {
      return;
    }

    var request = {
      origin: (document.getElementById('PickupPoint') as HTMLInputElement)
        .value,
      destination: (document.getElementById('DropPoint') as HTMLInputElement)
        .value,
      travelMode: 'DRIVING',
      waypoints: this.wayPoints,
      optimizeWaypoints: true,
    };
    directionsService.route(request, (response: any, status: string) => {
      if (status == 'OK') {
        directionsRenderer.setDirections(response);
        this.initDistanceMatrix();
      } else if (status === 'ZERO_RESULTS') {
        this.toastr.error('No Direct Routes Are Available');
      }
    });
  }

  initDistanceMatrix() {
    this.wayPoints = [];
    for (let index = 1; index <= this.stops.length; index++) {
      this.wayPoints.push(
        (document.getElementById(`Drop${index}`) as HTMLInputElement).value
      );
    }
    this.wayPoints.push(
      (document.getElementById('DropPoint') as HTMLInputElement).value
    );
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [
          (document.getElementById('PickupPoint') as HTMLInputElement).value,
        ],
        destinations: this.wayPoints,
        travelMode: 'DRIVING',
      },

      (response: any, status: any) => {
        if (status === 'OK') {
          var total_distance = 0.0;
          var total_time = 0.0;

          for (var i = 0; i < response.rows[0].elements.length; i++) {
            total_distance += response.rows[0].elements[i].distance.value;
            total_time += response.rows[0].elements[i].duration.value;
          }
          this.Distance = total_distance / 1000;
          this.Time =
            Math.floor(total_time / 3600) +
            '.' +
            Math.floor((total_time % 3600) / 60);
          this.tripDetails.Distance = total_distance / 1000 + 'Km';
          const hours = Math.floor(total_time / 3600);
          const minutes = Math.floor((total_time % 3600) / 60);

          this.tripDetails.Time = `${hours} hr ${minutes} min`;
        }
      }
    );
  }

  CheckPricing() {
    let formData = new FormData();
    if (
      !this.isServiceZone.city ||
      !this.RideDetailsForm.get('VehicleSelector').value
    ) {
      return;
    }
    formData.append('city', this.isServiceZone.city);
    formData.append('type', this.RideDetailsForm.get('VehicleSelector').value);
    this.pricingService.initGetPricingForZone(formData).subscribe({
      next: (data) => {
        setTimeout(() => {
          if (data) {
            console.log(data);
            if (!this.tripDetails.Distance || !this.tripDetails.Time) {
              return;
            }
            console.log(this.Time);

            this.GetChargeofTrip(
              +data[0].MinFarePrice,
              +data[0].BasePrice,
              +data[0].BasePriceDistance,
              +data[0].DistancePrice,
              +data[0].TimePrice,
              +this.Distance,
              +this.Time,
              +data[0].MaxSpace
            );
          }
        }, 1000);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  OnRideDetailsFormSubmit() {
    this.isSubmitted = true;
    if (!this.RideDetailsForm.valid) {
      return;
    }
   let formData = new FormData();
   console.log(this.user);
   console.log(this.wayPoints);
   
    
  }

  GetChargeofTrip(
    MinFare: number,
    BasePrice: number,
    BasePriceDistance: any,
    UnitDistancePrice: any,
    UnitTimePrice: number,
    Distance: number,
    Time: any,
    MaxSpace?: number
  ) {
    let ServiceFees;
    let DistanceAmount;
    let TimeAmount;
    if (Distance > BasePriceDistance) {
      DistanceAmount = (Distance - BasePriceDistance) * UnitDistancePrice;
    } else {
      DistanceAmount = 0;
    }

    TimeAmount = Time * UnitTimePrice;

    ServiceFees = DistanceAmount + TimeAmount + BasePrice;

    if (ServiceFees <= MinFare) {
      ServiceFees = MinFare;
    }

    console.log(ServiceFees);

    return ServiceFees;
  }
}
