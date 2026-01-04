import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
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
  userEmail: string | null = null;
  isLoggedIn = false;
  isDropdownOpen = false;
  currentDate = '';

  constructor(
    private authService: AuthService,
    private sessionTimeoutService: SessionTimeoutService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to authentication state
    this.authService.isAuthenticated$.subscribe((isAuth: boolean) => {
      this.isLoggedIn = isAuth;
      if (isAuth) {
        const user = this.authService.getUser();
        if (user) {
          this.username = user.username;
          this.userEmail = user.email;
        }
      }
    });
    
    // Subscribe to username changes
    this.authService.username$.subscribe((username: string | null) => {
      this.username = username;
    });
    
    // Initialize values
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = this.authService.getUsername();
    const user = this.authService.getUser();
    if (user) {
      this.userEmail = user.email;
    }
    
    // Set current date
    this.updateDate();
  }

  updateDate() {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.currentDate = date.toLocaleDateString('en-US', options);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  goToProfile() {
    this.closeDropdown();
    this.router.navigate(['/profile']);
  }

  logout() {
    this.closeDropdown();
    this.sessionTimeoutService.stopSession();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.closeDropdown();
    }
  }
}

