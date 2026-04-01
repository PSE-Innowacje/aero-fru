import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { LoginRequest, LoginResponse, CurrentUser } from '../models/user.model';
import { RoleName } from '../constants';

const TOKEN_KEY = 'aero_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<CurrentUser | null>(null);
  private tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenSignal());
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  constructor() {
    if (this.tokenSignal()) {
      this.loadCurrentUser();
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', request).pipe(
      tap(response => {
        localStorage.setItem(TOKEN_KEY, response.token);
        this.tokenSignal.set(response.token);
        this.loadCurrentUser();
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  hasRole(...roles: RoleName[]): boolean {
    const currentRole = this.userRole();
    return currentRole !== null && roles.includes(currentRole as RoleName);
  }

  loadCurrentUser(): void {
    this.http.get<CurrentUser>('/api/auth/me').pipe(
      catchError(() => {
        this.logout();
        return of(null);
      })
    ).subscribe(user => {
      if (user) {
        this.currentUserSignal.set(user);
      }
    });
  }
}
