import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
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

export interface UserApplicationsRoles {
  userId: number;
  applications: Application[];
}

export const ACCESS_DENIED_MESSAGE =
  'Access denied. You do not have permission to access this application.';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4501/api/auth';
  private usersApiUrl = 'http://localhost:4501/api/users';
  private readonly requiredAppName = 'MyEmpHist';
  private tokenKey = 'auth_token';
  private usernameKey = 'auth_username';
  private userKey = 'auth_user';
  private appAccessKey = 'app_access_verified';
  private rolesKey = 'auth_roles';
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

  verifyApplicationAccess(userId: number): Observable<boolean> {
    return this.http
      .get<UserApplicationsRoles>(`${this.usersApiUrl}/${userId}/applications-roles`, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(response => this.validateApplicationAccess(response)),
        tap(hasAccess => {
          if (hasAccess) {
            localStorage.setItem(this.appAccessKey, 'true');
          }
        })
      );
  }

  hasAppAccess(): boolean {
    return localStorage.getItem(this.appAccessKey) === 'true';
  }

  getUserRoles(): Role[] {
    const rolesStr = localStorage.getItem(this.rolesKey);
    return rolesStr ? JSON.parse(rolesStr) : [];
  }

  private validateApplicationAccess(response: UserApplicationsRoles): boolean {
    const app = response.applications?.find(
      application => application.appName === this.requiredAppName
    );

    if (!app || !app.roles?.length) {
      return false;
    }

    localStorage.setItem(this.rolesKey, JSON.stringify(app.roles));
    return true;
  }

  logout(accessDenied = false): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.appAccessKey);
    localStorage.removeItem(this.rolesKey);
    localStorage.removeItem('staySignedIn');
    this.isAuthenticatedSubject.next(false);
    this.usernameSubject.next(null);

    if (accessDenied) {
      this.router.navigate(['/login'], { queryParams: { error: 'access_denied' } });
    } else {
      this.router.navigate(['/login']);
    }
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

