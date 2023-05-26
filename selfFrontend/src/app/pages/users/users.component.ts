import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'src/app/Services/users.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  error: any;
  displayerror = false;
  isSearchMode = false;
  isSubmitted = false;
  selectedFile: any = null;
  UsersForm: FormGroup | any;
  UsersData: any;
  userId: any;
  isEditMode = false;
  p=1;

  constructor(private usersService: UsersService, public dialog: MatDialog) {
    this.UsersForm = new FormGroup({
      UserFile: new FormControl(null),
      UserName: new FormControl(null, [Validators.required]),
      UserEmail: new FormControl(null, [Validators.required, Validators.email]),
      CountryCode: new FormControl(null, [Validators.required]),
      UserPhone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^((\\+91-?)|0)?[0-9\\s-]{10}$'),
      ]),
    });
  }
  openDialog(user: any) {
    const dialogRef = this.dialog.open(CardComponent, {
      width: '600px',
      data: user,
    });
  }
  ngOnInit(): void {
    this.getAllUserReq();
  }

  onSubmit() {
    this.isSubmitted = true;

    if (!this.UsersForm.valid) {
      return;
    }
    const formData = new FormData();
    if (!this.selectedFile) {
      formData.append('profile', '');
    } else {
      formData.append('profile', this.selectedFile);
    }

    formData.append('UserName', this.UsersForm.get('UserName').value);
    formData.append('UserEmail', this.UsersForm.get('UserEmail').value);
    formData.append('CountryCode', this.UsersForm.get('CountryCode').value);
    formData.append('UserPhone', this.UsersForm.get('UserPhone').value);
    console.log(formData);

    if (!this.isEditMode) {
      this.usersService.initUsers(formData).subscribe({
        next: (data) => {
          this.getAllUserReq();
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
      this.usersService.initEditUsers(this.userId, formData).subscribe({
        next: (data) => {
          this.getAllUserReq();
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

  onSearch() {
    this.isSearchMode = !this.isSearchMode;
    this.getAllUserReq();
  }

  get f() {
    return this.UsersForm.controls;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSearchUsers(sortColomnn?: any) {
    let searchValue;
    if (!(document.getElementById('searchBtn') as HTMLInputElement)) {
      searchValue = '';
    } else {
      searchValue = (document.getElementById('searchBtn') as HTMLInputElement)
        .value;
    }

    this.usersService.initGetUsers(searchValue, sortColomnn).subscribe({
      next: (data) => {
        this.UsersData = data;
        this.initReset();
      },
      error: (error) => {
        console.log(error);

        this.error = error;
        this.displayerror = true;
      },
    });
  }

  oncencel() {
    this.initReset();
  }

  onEditUser(user: any) {
    this.isEditMode = true;
    this.isSearchMode = false;
    this.userId = user._id;
    const a = user.UserPhone.split('-');

    this.UsersForm.patchValue({
      UserName: user.UserName,
      UserEmail: user.UserEmail,
      CountryCode: +a[0],
      UserPhone: +a[1],
    });
  }

  onDeleteUser(id: any) {
    this.usersService.initDeleteUsers(id).subscribe({
      next: (data) => {
        this.getAllUserReq();
      },
      error: (error) => {
        this.error = error.error;
        this.displayerror = true;
      },
    });
  }

  initReset() {
    // this.isSearchMode = false;
    this.selectedFile = null;
    this.isSubmitted = false;
    this.displayerror = false;
    this.userId = null;
    this.error = null;
    this.isEditMode = false;
    this.UsersForm.reset();
  }

  getAllUserReq() {
    this.usersService.initGetUsers().subscribe({
      next: (data) => {
        this.UsersData = data;
        this.initReset();
      },
      error: (error) => {
        console.log(error);

        this.error = error;
        this.displayerror = true;
      },
    });
  }

  getImageSource(user: any) {
    return user.profile
      ? `http://localhost:3000/uploads/Users/${user.profile}`
      : 'http://localhost:3000/uploads/nouser.png';
  }
}
