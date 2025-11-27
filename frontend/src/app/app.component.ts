import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SessionWarningComponent } from './components/session-warning/session-warning.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { SessionTimeoutService } from './services/session-timeout.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, SessionWarningComponent, ConfirmationDialogComponent],
  template: `
    <app-header *ngIf="showHeaderFooter"></app-header>
    <main [class.container]="showHeaderFooter" [style.min-height]="showHeaderFooter ? 'calc(100vh - 140px)' : '100vh'">
      <router-outlet></router-outlet>
    </main>
    <app-footer *ngIf="showHeaderFooter"></app-footer>
    <app-session-warning></app-session-warning>
    <app-confirmation-dialog></app-confirmation-dialog>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Employment History';
  showHeaderFooter = true;

  constructor(
    private router: Router,
    private sessionTimeoutService: SessionTimeoutService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check initial route
    this.showHeaderFooter = this.router.url !== '/login';
    
    // Initialize session timeout if user is already logged in
    if (this.authService.isLoggedIn()) {
      // Check if stay signed in was previously set (you can store this in localStorage)
      const staySignedIn = localStorage.getItem('staySignedIn') === 'true';
      this.sessionTimeoutService.startSession(staySignedIn);
    }
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHeaderFooter = event.url !== '/login';
    });
  }
}

