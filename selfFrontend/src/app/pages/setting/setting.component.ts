import { Component, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingService } from 'src/app/Services/setting.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {
  Settinglist: any;
  SettingForm: Form | any;
  constructor(
    private settingService: SettingService,
    private toastr: ToastrService
  ) {
    this.SettingForm = new FormGroup({
      RideStops: new FormControl(this.Settinglist?.RideStops, [
        Validators.required,
      ]),
      ReqCronTime: new FormControl(this.Settinglist?.ReqCronTime, [
        Validators.required,
      ]),
    });
  }
  ngOnInit(): void {
    this.getSettings();
  }

  onCancel() {
    this.SettingForm.patchValue({
      RideStops: this.Settinglist.RideStops,
      ReqCronTime: this.Settinglist.ReqCronTime,
    });
  }
  onSave(id: any) {
    let formData = new FormData();
    formData.append('id', id);
    formData.append('RideStops', this.SettingForm.get('RideStops').value);
    formData.append('ReqCronTime', this.SettingForm.get('ReqCronTime').value);

    this.settingService.initChangeSettings(formData).subscribe({
      next: (data) => {
        this.Settinglist = data;
        this.toastr.success("Setting Updated")
      },
      error: (error) => {
        this.toastr.error(error.message);
      },
    });
  }

  getSettings() {
    this.settingService.initGetSettings().subscribe({
      next: (data: any) => {
        this.Settinglist = data[0];

        if (data[0]) {
          this.SettingForm.patchValue({
            RideStops: data[0]?.RideStops,
            ReqCronTime: data[0]?.ReqCronTime,
          });
        }
      },
      error: (error) => {
        this.toastr.error(error.message)
      },
    });
  }
}
