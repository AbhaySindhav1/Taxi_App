import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RideService } from 'src/app/Services/ride.service';
import { UsersService } from 'src/app/Services/users.service';

declare var google: any;
@Component({
  selector: 'app-create-ride',
  templateUrl: './create-ride.component.html',
  styleUrls: ['./create-ride.component.css'],
})
export class CreateRideComponent implements OnInit {
  [x: string]: any;
  phoneNumber: any;
  user: any;
  countryer = false;
  email: any;
  name: any;
  stops: any = [];
  RideForm: FormGroup | any;
  RideDetailsForm: FormGroup | any;
  map: google.maps.Map | any;
  isSubmitted = false;
  isServiceAvailable = false;
  isServiceZone: any = null;
  error = false;
  errMassage: any;
  allPlaces: any = {};
  tripDetails: any = {};
  RideDetailsFormShow = false;
  wayPoints: any = [];

  constructor(
    private usersService: UsersService,
    private rideService: RideService,
    private toastr: ToastrService
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
          }
          if (!this.isServiceZone) {
            
            this.isServiceZone = data[0];
            console.log(this.isServiceZone);
           
          } else {
            if (data[0]._id !== this.isServiceZone._id) {
              console.log('11');
              
              let a = `${fieldName}`;
              this.toastr.error(a + ` is not in Same Services Zone`);
              (
                document.getElementById(`${fieldName}`) as HTMLInputElement
              ).value = '';
              (
                document.getElementById(`${fieldName}`) as HTMLInputElement
              ).focus();
              return;
            }
          }
        },
        error: (error) => {
          console.log(error);
          this.errMassage = error;
          this.error = true;
        },
      });
    });
  }

  removeDrop(Id: any) {
    this.RideDetailsForm.removeControl(Id);
    this.stops.pop(Id);
  }

  initDirection() {
    console.log(this.wayPoints);

    let directionsRenderer = new google.maps.DirectionsRenderer();
    let directionsService = new google.maps.DirectionsService();
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
        console.log('1');
        if (status == 'OK') {
        directionsRenderer.setDirections(response);
        this.initDistanceMatrix();
      }
    });
  }

  initDistanceMatrix() {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [
          (document.getElementById('PickupPoint') as HTMLInputElement).value,
        ],
        destinations: [
          (document.getElementById('DropPoint') as HTMLInputElement).value,
        ],
        travelMode: 'DRIVING',
      },
      (response: any, status: any) => {

        if (status === 'OK') {
          console.log(response.rows[0].elements[0].distance.text);

          this.tripDetails.Distance =
            response.rows[0].elements[0].distance.text;
          this.tripDetails.Time = response.rows[0].elements[0].duration.text;
          console.log(response.rows[0].elements[0].duration.text);
          this.isSubmitted = false;
        }
      }
    );
  }

  OnRideDetailsFormSubmit() {
    this.isSubmitted = true;
    if (!this.RideDetailsForm.valid) {
      return;
    }
    this.wayPoints = [];

    for (let index = 1; index <= this.stops.length; index++) {
      this.wayPoints.push({
        location: (document.getElementById(`Drop${index}`) as HTMLInputElement)
          .value,
        stopover: true,
      });
    }

    for (let index = 0; index < this.wayPoints.length; index++) {
      console.log(this.wayPoints[index]);
    }

    this.initDirection();
  }

  GetChargeofTrip(
    MinFare: number,
    BasePrice: number,
    BasePriceDistance: any,
    UnitDistancePrice: any,
    UnitTimePrice: number,
    Distance: number,
    Time: any,
    MaxSpace: number
  ) {}
}
