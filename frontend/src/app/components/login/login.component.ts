import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
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
            // Start session timeout with stay signed in preference
            const staySignedIn = this.loginForm.value.staySignedIn || false;
            localStorage.setItem('staySignedIn', staySignedIn.toString());
            this.sessionTimeoutService.startSession(staySignedIn);
            this.router.navigate(['/']);
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

