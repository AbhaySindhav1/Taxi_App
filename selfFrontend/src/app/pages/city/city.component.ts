import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CityService } from 'src/app/Services/city.service';
import { CountryService } from 'src/app/Services/country.service';

declare var google: any;

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css'],
})
export class CityComponent implements OnInit {
  @ViewChild('mySelect') selectElement: any;
  Citylist: any;
  array = [];
  ContryList: any;
  isPolygonDrawn: any;
  polygon: any;
  polygons: any = [];
  drawingManager: any;
  title = 'City Task';
  error: any;
  uniqueCities: any;
  map: google.maps.Map | any;
  changed = false;
  country: any;
  zone: any;
  IsEditMode = false;
  UserID: any;
  coordinates: any = [];
  autocomplete: google.maps.places.Autocomplete | any;
  constructor(
    private cityService: CityService,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.changed = true;
    this.cityService
      .initGetDataFromUrl('https://restcountries.com/v3.1/all')
      .subscribe((data: any) => {
        this.array = data;
        // this.ContryDetailList = data.sort((a: any, b: any) =>
        //   a.name.common.localeCompare(b.name.common)
        // );
      });
    this.countryService.initonlyCountry().subscribe({
      next: (data) => {
        this.ContryList = data.sort();
      },
      
    });
    this.initMap();
    this.cityService.initGetAllCities().subscribe({
      next: (data) => {
        this.Citylist = data;
      },
      error: (error) => {
        console.log(error);
        
        this.error = error;
        this.changed = false;
      },
    });

  }

  initMap(lat = 23, lng = 73, zoom = 7) {
    let loc = { lat: +lat, lng: +lng };

    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      { center: loc, zoom, mapTypeId: google.maps.MapTypeId.ROADMAP }
    );
    this.initAutoComplete('US');
    this.initPolygon();
  }
  initPolygon() {
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon'],
      },
    });
    this.drawingManager.setMap(this.map);

    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (event: any) => {
        // console.log(event.path.b[0]);
        
        if (this.isPolygonDrawn) {
          this.polygon.setMap(null);
        }
        this.isPolygonDrawn = true;
        this.polygon = event.overlay;
        var ArrayOfZoneCordinates: any = [];
        var cordinatesAraa: any = [];
        var path = this.polygon.getPath();

        path.forEach((latLng: any) => {
          ArrayOfZoneCordinates.push({
            lng: latLng.lng(),
            lat: latLng.lat(),
          });

          this.coordinates = [];

          cordinatesAraa.push([ latLng.lng(),latLng.lat()]);
        });

        this.coordinates = [...cordinatesAraa, cordinatesAraa[0]];

        this.zone = ArrayOfZoneCordinates;
        console.log(this.coordinates);
        

        this.polygon.setEditable(true);
        this.drawingManager.setDrawingMode(null);
      }
    );
  }

  onCountrySelect() {
    this.changed = false;
    this.country = '';

    const selectCountry =
      this.selectElement.nativeElement.options[
        this.selectElement.nativeElement.selectedIndex
      ].value;

    if (selectCountry == 'null') {
      this.error = 'Please Select Country';
      this.changed = false;
      return;
    } else {
      this.changed = true;
    }
    this.country = selectCountry;

    let contryobject: any = this.cityService.travreseArray(
      selectCountry,
      this.array
    );

    this.updateAutoComplete(contryobject[0].cca2);

    if (!contryobject) {
      return;
    }
  }

  onSubmit() {
    this.changed = false;

    const city = (document.getElementById('city') as HTMLInputElement).value;

    if (!this.country && !this.zone && !city) {
      this.error = 'Country, zone, and city are required';
      return;
    } else if (!this.country && !this.zone) {
      this.error = 'Country and zone are required';
      return;
    } else if (!this.country && !city) {
      this.error = 'Country and city are required';
      return;
    } else if (!this.zone && !city) {
      this.error = 'Zone and city are required';
      return;
    } else if (!this.country) {
      this.error = 'Country is required';
      return;
    } else if (!this.zone) {
      this.error = 'Zone is required';
      return;
    } else if (!city) {
      this.error = 'City is required';
      return;
    } else {
      this.error = '';
    }
 
    let formData = new FormData();
    formData.append('country', this.country);
    formData.append('city', city);
    formData.append('zone', JSON.stringify(this.zone));
    formData.append(
      'Location',
      JSON.stringify({ type: 'Polygon', coordinates: [this.coordinates] })
    );
    // formData.append('zone',{type:'Polygon} ,JSON.stringify(this.zone));

    if (!this.IsEditMode) {
      this.cityService.initAddCityData(formData).subscribe({
        next: (data) => {
          this.changed = true;

          this.cityService.initGetAllCities().subscribe({
            next: (data) => {
              this.Citylist = data;
            },
            error: (error) => {
              console.log(error);
              
              this.error = error;
              this.changed = false;
            },
          });
        },
        error: (error) => {
          this.error = error.error;
        },
      });
    } else {
      this.cityService.initEditCity(this.UserID, formData).subscribe({
        next: (data) => {
          this.cityService.initGetAllCities().subscribe({
            next: (data) => {
              this.Citylist = data;
              this.IsEditMode = false;
              this.onReset();
            },
            error: (error) => {
              this.error = error;
              this.changed = false;
            },
          });
        },
        error: (error) => {
          this.error = error.error;
        },
      });
    }
  }

  onEdit(city: any) {
    this.UserID = city._id;
    if (this.polygon) {
      this.polygon.setMap(null);
    }

    const Value = { Value: city.country };

    this.polygons.forEach((polygon: any) => {
      polygon.setMap(null);
    });

    this.IsEditMode = true;

    this.zone = city.zone;

    const polygon = new google.maps.Polygon({
      paths: this.zone,
      editable: true,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillOpacity: 0.35,
    });

    // Add event listeners to the polygon's path
    const path = polygon.getPath();

    google.maps.event.addListener(path, 'set_at', (index: any) => {
      this.getCordinates(path);
    });

    google.maps.event.addListener(path, 'insert_at', (index: any) => {
      this.getCordinates(path);
    });

    google.maps.event.addListener(path, 'remove_at', (index: any) => {
      this.getCordinates(path);
    });

    // Disable Adding for any other polygons on the map

    if (this.drawingManager) {
      this.drawingManager.setMap(null);
    }

    // Add the polygon to the map

    polygon.setMap(this.map);
    this.polygons.push(polygon);
    const bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < city.zone.length; i++) {
      bounds.extend(city.zone[i]);
    }
    this.map.fitBounds(bounds);

    this.selectElement.nativeElement.value = city.country;
    this.country = city.country;

    (document.getElementById('city') as HTMLInputElement).value = city.city;
  }

  onDelete(city: any) {
    this.cityService.initDeleteCountry(city._id).subscribe({
      next: (data) => {
        this.cityService.initGetAllCities().subscribe({
          next: (data) => {
            this.Citylist = data;
          },
          error: (error) => {
            this.error = error;
            this.changed = false;
          },
        });
      },
      error: (error) => {
        this.error = error;
        this.changed = false;
      },
    });
  }

  getCordinates(path: any) {
    let ArrayOfZoneCordinates: any = [];
    const cord: any = []; //
    path.forEach((latLng: any) => {
      ArrayOfZoneCordinates.push({
        lng: latLng.lng(),
        lat: latLng.lat(),
      });

      cord.push([latLng.lng(), latLng.lat()]); ///
    });
    this.coordinates = [...cord, cord[0]];
    this.zone = ArrayOfZoneCordinates;
  }

  initAutoComplete(country: string) {
    // create the Autocomplete with the specified country
    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('city') as HTMLInputElement,
      {
        types: ['(cities)'],
        componentRestrictions: { country: country },
      }
    );

    // add a listener to handle when a place is selected
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();

      if (!place.geometry) {
        console.error(`No geometry for ${place.name}`);
        return;
      }
      
      this.map.fitBounds(place.geometry.viewport);
    });
  }

  updateAutoComplete(country: string) {
    // update the componentRestrictions with the new country
    this.autocomplete.setComponentRestrictions({ country: country });
  }
  onReset() {
    this.selectElement.nativeElement.value = null;
    this.country = null;
    this.error = null;
    if (this.polygon) {
      this.polygon.setMap(null);
    }

    this.IsEditMode = false;
    this.zone = null;
    this.changed = false;
    this.UserID = null;
    (document.getElementById('city') as HTMLInputElement).value = '';
    this.polygons.forEach((polygon: any) => {
      polygon.setMap(null);
    });
  }
}
