import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {
  private readonly TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly WARNING_DURATION = 2 * 60 * 1000; // 2 minutes warning before timeout
  private timeoutTimer: any;
  private warningTimer: any;
  private lastActivityTime: number = Date.now();
  private staySignedIn: boolean = false;
  
  private warningSubject = new Subject<number>();
  public warning$: Observable<number> = this.warningSubject.asObservable();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.initActivityTracking();
  }

  initActivityTracking() {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.resetTimer(), true);
    });
  }

  startSession(staySignedIn: boolean = false) {
    this.staySignedIn = staySignedIn;
    this.lastActivityTime = Date.now();
    this.clearTimers();
    
    if (!staySignedIn) {
      this.startTimeout();
    }
  }

  resetTimer() {
    if (!this.staySignedIn && this.authService.isLoggedIn()) {
      this.lastActivityTime = Date.now();
      this.clearTimers();
      this.startTimeout();
    }
  }

  private startTimeout() {
    // Clear any existing timers
    this.clearTimers();

    // Start warning timer (2 minutes before timeout)
    this.warningTimer = setTimeout(() => {
      const remainingTime = this.TIMEOUT_DURATION - this.WARNING_DURATION;
      this.warningSubject.next(remainingTime);
    }, this.TIMEOUT_DURATION - this.WARNING_DURATION);

    // Start timeout timer
    this.timeoutTimer = setTimeout(() => {
      this.handleTimeout();
    }, this.TIMEOUT_DURATION);
  }

  private handleTimeout() {
    if (this.authService.isLoggedIn() && !this.staySignedIn) {
      this.stopSession();
      alert('Your session has expired due to inactivity. You will be logged out.');
      this.authService.logout();
    }
  }

  clearTimers() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  stopSession() {
    this.clearTimers();
    this.staySignedIn = false;
  }

  extendSession() {
    this.resetTimer();
  }

  setStaySignedIn(value: boolean) {
    this.staySignedIn = value;
    if (value) {
      this.clearTimers();
    } else {
      this.resetTimer();
    }
  }

  isStaySignedIn(): boolean {
    return this.staySignedIn;
  }
}

