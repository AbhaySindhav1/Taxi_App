import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthGuardService } from 'src/app/Services/auth-guard.service';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  error:any;
  LoginForm: FormGroup | any;
  // LoginMode = true ;

  // passwordValidator = Validators.compose([
  //   Validators.required,
  //   Validators.minLength(8),
  //   Validators.maxLength(20),
  //   Validators.pattern(
  //     "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()\\-_=+{}[\\]|;:',.<>/?])([A-Za-z\\d!@#$%^&*()\\-_=+{}[\\]|;:',.<>/?]){8,}$"
  //   ),
  // ]);

  constructor(private authService: AuthService,private authGuardService:AuthGuardService, private router: Router) {}

  ngOnInit(): void {
    this.LoginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
    });
    
  }
  

  onSubmit() {
    
    this.authService
      .InItLogin(this.LoginForm.value.email, this.LoginForm.value.password)
      .subscribe({
        next: (data) => {
          this.router.navigate(['dashboard'])
        },
        error: (error) => this.error= error.error,
        complete: () => {},
      });
    this.LoginForm.reset();
  }
}
