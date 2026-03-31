import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card-wrapper">
        <div class="login-logo">
          <mat-icon class="logo-icon">flight</mat-icon>
          <h1>AERO FRU</h1>
          <p>System ewidencji operacji lotniczych</p>
        </div>

        <mat-card>
          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" autocomplete="email">
                <mat-icon matPrefix>email</mat-icon>
                @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                  <mat-error>Email jest wymagany</mat-error>
                }
                @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                  <mat-error>Nieprawidłowy format email</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Hasło</mat-label>
                <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'" autocomplete="current-password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error>Hasło jest wymagane</mat-error>
                }
              </mat-form-field>

              @if (errorMessage()) {
                <div class="error-message">
                  <mat-icon>error_outline</mat-icon>
                  {{ errorMessage() }}
                </div>
              }

              <button mat-raised-button color="primary" type="submit" class="full-width login-btn" [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Zaloguj się
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as v;

    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: v.$sidebar-gradient;
    }

    .login-card-wrapper {
      width: 100%;
      max-width: 420px;
      padding: 24px;
    }

    .login-logo {
      text-align: center;
      color: #fff;
      margin-bottom: 32px;

      .logo-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 8px;
      }

      h1 {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 2px;
        margin-bottom: 4px;
      }

      p {
        font-size: 14px;
        opacity: 0.8;
        font-weight: 300;
      }
    }

    mat-card {
      padding: 32px 24px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: v.$alert-red;
      font-size: 13px;
      margin-bottom: 16px;
      padding: 8px 12px;
      background: rgba(228, 37, 24, 0.08);
      border-radius: v.$border-radius-sm;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .login-btn {
      margin-top: 8px;
      height: 44px;
      font-size: 15px;
      font-weight: 600;
      background-color: v.$primary-navy !important;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  loading = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Nieprawidłowy email lub hasło');
      }
    });
  }
}
