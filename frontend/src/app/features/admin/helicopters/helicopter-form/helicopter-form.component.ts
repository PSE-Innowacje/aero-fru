import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HelicopterService } from '../helicopter.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ROLES } from '../../../../core/constants';

@Component({
  selector: 'app-helicopter-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-header">
      <h2>{{ isEditMode() ? 'Edycja helikoptera' : 'Nowy helikopter' }}</h2>
    </div>

    <mat-card>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Numer rejestracyjny</mat-label>
              <input matInput formControlName="registrationNumber" maxlength="30">
              <mat-error>Numer rejestracyjny jest wymagany</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Typ helikoptera</mat-label>
              <input matInput formControlName="helicopterType" maxlength="100">
              <mat-error>Typ helikoptera jest wymagany</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-span">
              <mat-label>Opis</mat-label>
              <input matInput formControlName="description" maxlength="100">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Maks. liczba członków załogi</mat-label>
              <input matInput type="number" formControlName="maxCrewMembers" min="1" max="10">
              <mat-error>Wartość 1–10</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Maks. udźwig załogi (kg)</mat-label>
              <input matInput type="number" formControlName="maxCrewWeightKg" min="1" max="1000">
              <mat-error>Wartość 1–1000</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="active">Aktywny</mat-option>
                <mat-option value="inactive">Nieaktywny</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data ważności przeglądu</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="inspectionValidUntil">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              @if (form.get('status')?.value === 'active') {
                <mat-error>Data przeglądu jest wymagana dla statusu aktywny</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Zasięg bez lądowania (km)</mat-label>
              <input matInput type="number" formControlName="rangeKm" min="1" max="1000">
              <mat-error>Wartość 1–1000</mat-error>
            </mat-form-field>
          </div>

          @if (canEdit()) {
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">Anuluj</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
                @else { {{ isEditMode() ? 'Zapisz zmiany' : 'Utwórz' }} }
              </button>
            </div>
          }
        </form>
      }
    </mat-card>
  `,
  styles: [`
    @use 'styles/variables' as v;

    .page-header { margin-bottom: 20px; h2 { font-size: 22px; font-weight: 700; color: v.$primary-navy; } }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 20px;
      padding: 16px 0;
    }
    .full-span { grid-column: 1 / -1; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid v.$border-color;
    }
    button[mat-raised-button] { background-color: v.$primary-navy !important; }
  `]
})
export class HelicopterFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private helicopterService = inject(HelicopterService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  private helicopterId?: number;

  form = this.fb.nonNullable.group({
    registrationNumber: ['', [Validators.required, Validators.maxLength(30)]],
    helicopterType: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    maxCrewMembers: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    maxCrewWeightKg: [100, [Validators.required, Validators.min(1), Validators.max(1000)]],
    status: ['active', Validators.required],
    inspectionValidUntil: [null as Date | null],
    rangeKm: [100, [Validators.required, Validators.min(1), Validators.max(1000)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.helicopterId = +id;
      this.loading.set(true);
      this.helicopterService.getById(this.helicopterId).subscribe({
        next: h => {
          this.form.patchValue({
            registrationNumber: h.registrationNumber,
            helicopterType: h.helicopterType,
            description: h.description ?? '',
            maxCrewMembers: h.maxCrewMembers,
            maxCrewWeightKg: h.maxCrewWeightKg,
            status: h.status,
            rangeKm: h.rangeKm,
            inspectionValidUntil: h.inspectionValidUntil ? new Date(h.inspectionValidUntil) : null
          });
          if (!this.canEdit()) this.form.disable();
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.notification.showError('Nie znaleziono helikoptera'); }
      });
    }
  }

  canEdit(): boolean {
    return this.authService.hasRole(ROLES.ADMIN);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.canEdit()) return;

    this.saving.set(true);
    const val = this.form.getRawValue();
    const request = {
      ...val,
      inspectionValidUntil: val.inspectionValidUntil ? this.formatDate(val.inspectionValidUntil) : undefined,
      description: val.description || undefined
    };

    const obs = this.isEditMode()
      ? this.helicopterService.update(this.helicopterId!, request)
      : this.helicopterService.create(request);

    obs.subscribe({
      next: () => {
        this.notification.showSuccess(this.isEditMode() ? 'Helikopter zaktualizowany' : 'Helikopter utworzony');
        this.router.navigate(['/admin/helicopters']);
      },
      error: (err) => { this.saving.set(false); this.notification.showApiError(err); }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/helicopters']);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
