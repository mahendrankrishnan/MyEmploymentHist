import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionTimeoutService } from '../../services/session-timeout.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-session-warning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-warning.component.html',
  styleUrl: './session-warning.component.css'
})
export class SessionWarningComponent implements OnInit, OnDestroy {
  showWarning = false;
  remainingMinutes = 0;
  private warningSubscription?: Subscription;

  constructor(
    private sessionTimeoutService: SessionTimeoutService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.warningSubscription = this.sessionTimeoutService.warning$.subscribe(remainingTime => {
      this.remainingMinutes = Math.ceil(remainingTime / 60000); // Convert to minutes
      this.showWarning = true;
    });
  }

  ngOnDestroy() {
    if (this.warningSubscription) {
      this.warningSubscription.unsubscribe();
    }
  }

  extendSession() {
    this.sessionTimeoutService.extendSession();
    this.showWarning = false;
  }

  logout() {
    this.sessionTimeoutService.stopSession();
    this.showWarning = false;
    this.authService.logout();
  }
}

