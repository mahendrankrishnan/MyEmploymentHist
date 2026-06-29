import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, ACCESS_DENIED_MESSAGE } from '../../services/auth.service';
import { SessionTimeoutService } from '../../services/session-timeout.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sessionTimeoutService: SessionTimeoutService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      staySignedIn: [false]
    });
  }

  ngOnInit() {
    if (this.route.snapshot.queryParamMap.get('error') === 'access_denied') {
      this.errorMessage = ACCESS_DENIED_MESSAGE;
    }

    if (this.authService.isLoggedIn() && this.authService.hasAppAccess()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = '';

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        phone: this.loginForm.value.phone
      };
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          if (response.message === 'Login successful' && response.token) {
            this.authService.verifyApplicationAccess(response.user.id).subscribe({
              next: (hasAccess) => {
                if (hasAccess) {
                  const staySignedIn = this.loginForm.value.staySignedIn || false;
                  localStorage.setItem('staySignedIn', staySignedIn.toString());
                  this.sessionTimeoutService.startSession(staySignedIn);
                  this.router.navigate(['/']);
                } else {
                  this.authService.logout(true);
                  this.errorMessage = ACCESS_DENIED_MESSAGE;
                  this.loading = false;
                }
              },
              error: () => {
                this.authService.logout(true);
                this.errorMessage = ACCESS_DENIED_MESSAGE;
                this.loading = false;
              }
            });
          } else {
            this.errorMessage = 'Login failed. Please check your credentials.';
            this.loading = false;
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Login failed. Please try again.';
          this.loading = false;
        }
      });
    }
  }
}

