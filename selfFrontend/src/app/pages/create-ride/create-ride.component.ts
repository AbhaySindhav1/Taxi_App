import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RideService } from 'src/app/Services/ride.service';
import { UsersService } from 'src/app/Services/users.service';
import { PricingService } from 'src/app/Services/pricing.service';
import { SettingService } from 'src/app/Services/setting.service';

declare var google: any;
let directionsRenderer = new google.maps.DirectionsRenderer();
let directionsService = new google.maps.DirectionsService();

@Component({
  selector: 'app-create-ride',
  templateUrl: './create-ride.component.html',
  styleUrls: ['./create-ride.component.css'],
})
export class CreateRideComponent implements OnInit {
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
  TripCharge: any;
  ways: any;
  maxStops: any;

  constructor(
    private usersService: UsersService,
    private rideService: RideService,
    private toastr: ToastrService,
    private pricingService: PricingService,
    private SettingsService: SettingService
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
      VehicleSelector: new FormControl(null, [Validators.required]),
      Time: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.initMap();

    this.SettingsService.initGetSettings().subscribe({
      next: (data:any) => {        
        this.maxStops = data[0]?.RideStops
      },
    });
  }

  onInput(e: any) {
    if (e.value.length === 10) {
      e.value = e.value.substring(0, 10);
      const number =
        '+' +
        +(document.getElementById('CountryCode') as HTMLInputElement).value +
        '-' +
        e.value;
      this.usersService.initGetUsers({ searchValue: number }).subscribe({
        next: (data) => {
          if (data.users.length === 0) {
            this.toastr.error('no user found');
            return;
          } else {
            if (data.users[0]) {
              this.user = data.users[0];
            }
            this.RideForm.patchValue({
              UserName: data.users[0].UserName,
              UserEmail: data.users[0].UserEmail,
            });
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      this.user = null;
      this.RideForm.patchValue({
        UserName: null,
        UserEmail: null,
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

    if (this.stops.length >= this.maxStops) {
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

    setTimeout(() => {
      this.setupAutocomplete('PickupPoint');
      this.setupAutocomplete('DropPoint');
      this.isSubmitted = false;
    }, 1);
    this.RideDetailsFormShow = true;
  }

  setupAutocomplete(fieldName: string) {
    this.tripDetails.TripCharge = null;
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
        this.rideService
          .initGetLocationValidation(location, place.formatted_address)
          .subscribe({
            next: (data) => {
              if (!data) {
                this.toastr.error('For This Location Service is Unavailable');
                this.RideDetailsForm.reset();
                (
                  document.getElementById(`${fieldName}`) as HTMLInputElement
                ).focus();
                return;
              } else {
                this.isServiceZone = data;

                this.GetCityVehicle(this.isServiceZone.city);
              }
            },
            error: (error) => {
              this.toastr.error(error);
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
    this.ways = [];
    for (let index = 1; index <= this.stops.length; index++) {
      this.ways.push(
        (document.getElementById(`Drop${index}`) as HTMLInputElement).value
      );
    }
    this.ways.push(
      (document.getElementById('DropPoint') as HTMLInputElement).value
    );

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [
          (document.getElementById('PickupPoint') as HTMLInputElement).value,
        ],
        destinations: this.ways,
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
          this.calculateFee();
        } else if (status === 'ZERO_RESULTS') {
          this.toastr.error('No Route Are Available');
        }
      }
    );
  }

  CheckPricing() {
    this.tripDetails.TripCharge = null;
    this.initDirection();
  }

  OnRideDetailsFormSubmit() {
    this.isSubmitted = true;
    if (!this.RideDetailsForm.valid) {
      return;
    }
    let confimed = confirm('Are You Want To Book Ride');
    if (!confimed) return;
    let formData = new FormData();
    formData.append('user_id', this.user._id);
    formData.append('UserName', this.user.UserName);
    formData.append('type', this.RideDetailsForm.get('VehicleSelector').value);
    formData.append('Distance', this.tripDetails.Distance);
    formData.append('Time', this.tripDetails.Time);
    formData.append('RideCity', this.isServiceZone._id);
    formData.append(
      'PickupPoint',
      (document.getElementById('PickupPoint') as HTMLInputElement).value
    );
    formData.append(
      'DropPoint',
      (document.getElementById('DropPoint') as HTMLInputElement).value
    );
    let stops = [];
    for (let index = 1; index <= this.stops.length; index++) {
      stops.push(
        (document.getElementById(`Drop${index}`) as HTMLInputElement).value
      );
    }

    formData.append('Stops', JSON.stringify(stops));
    let time;
    if (!this.RideDetailsForm.get('Time').value) {
      const now = new Date();
      time = now.toLocaleString();
    } else {
      const now = new Date(this.RideDetailsForm.get('Time').value);
      time = now.toLocaleString();
    }
    formData.append('ScheduleTime', time);
    formData.append('TripFee', this.tripDetails.TripCharge);
    this.rideService.initAddRideDetails(formData).subscribe({
      next: (data) => {
        this.toastr.success(data.message);
        this.OnReset();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  calculateFee() {
    if (
      !this.isServiceZone.city ||
      !this.RideDetailsForm.get('VehicleSelector').value
    ) {
      return;
    }
    let formData = new FormData();

    formData.append('city', this.isServiceZone.city);
    formData.append('type', this.RideDetailsForm.get('VehicleSelector').value);

    this.pricingService.initGetPricingForZone(formData).subscribe({
      next: (data) => {
        if (data.length > 0) {
          if (!this.Distance || !this.Time) {
            return;
          }

          let ServiceFees;
          let DistanceAmount;
          let TimeAmount;
          if (+this.Distance > +data[0].BasePrice) {
            DistanceAmount =
              (+this.Distance - +data[0].BasePrice) * +data[0].DistancePrice;
          } else {
            DistanceAmount = 0;
          }

          TimeAmount = +this.Time * +data[0].TimePrice;

          ServiceFees = DistanceAmount + TimeAmount + +data[0].BasePrice;

          if (ServiceFees <= +data[0].MinFarePrice) {
            ServiceFees = +data[0].MinFarePrice;
          }

          this.tripDetails.TripCharge = Math.ceil(ServiceFees);
          console.log(this.tripDetails.TripCharge);
          
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  GetCityVehicle(city: any) {
    this.pricingService.initGetAllVehicle(city).subscribe({
      next: (data) => {
        this.Vehicles = data;
      },
      error: (error) => {
        this.toastr.error(error);
      },
    });
  }

  OnReset() {
    this.Vehicles = [];
    this.stops = [];
    this.RideDetailsForm.reset();
    this.isSubmitted = false;
    this.isServiceAvailable = false;
    this.isServiceZone = null;
    this.error = false;
    this.errMassage = '';
    this.Distance = null;
    this.Time = null;
    this.allPlaces = {};
    this.tripDetails = {};
    this.wayPoints = [];
    directionsRenderer.setDirections(null);
    directionsRenderer.setMap(null);
  }
}
