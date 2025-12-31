import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginCredentials {
  email: string;
  password: string;
  phone: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
}

export interface Role {
  id: number;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: number;
  appName: string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
  applications: Application[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4501/api/auth';
  private tokenKey = 'auth_token';
  private usernameKey = 'auth_username';
  private userKey = 'auth_user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private usernameSubject = new BehaviorSubject<string | null>(this.getUsername());
  public username$ = this.usernameSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.message === 'Login successful' && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.usernameKey, response.user.username);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this.isAuthenticatedSubject.next(true);
          this.usernameSubject.next(response.user.username);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('staySignedIn');
    this.isAuthenticatedSubject.next(false);
    this.usernameSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

