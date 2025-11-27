import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionTimeoutService } from '../../services/session-timeout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  username: string | null = null;
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private sessionTimeoutService: SessionTimeoutService
  ) {}

  ngOnInit() {
    // Subscribe to authentication state
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
    });
    
    // Subscribe to username changes
    this.authService.username$.subscribe(username => {
      this.username = username;
    });
    
    // Initialize values
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = this.authService.getUsername();
  }

  logout() {
    this.sessionTimeoutService.stopSession();
    this.authService.logout();
  }
}

