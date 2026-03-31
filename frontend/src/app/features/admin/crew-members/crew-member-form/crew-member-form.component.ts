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
import { CrewMemberService } from '../crew-member.service';
import { DictionaryService } from '../../../../core/services/dictionary.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DictionaryItem } from '../../../../core/models/dictionary.model';
import { ROLES } from '../../../../core/constants';

@Component({
  selector: 'app-crew-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-header">
      <h2>{{ isEditMode() ? 'Edycja członka załogi' : 'Nowy członek załogi' }}</h2>
    </div>

    <mat-card>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Imię</mat-label>
              <input matInput formControlName="firstName" maxlength="100">
              <mat-error>Imię jest wymagane</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nazwisko</mat-label>
              <input matInput formControlName="lastName" maxlength="100">
              <mat-error>Nazwisko jest wymagane</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" maxlength="100">
              <mat-error>Prawidłowy email jest wymagany</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Waga (kg)</mat-label>
              <input matInput type="number" formControlName="weightKg" min="30" max="200">
              <mat-error>Waga 30–200 kg</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Rola</mat-label>
              <mat-select formControlName="roleId">
                @for (role of crewRoles(); track role.id) {
                  <mat-option [value]="role.id">{{ role.name }}</mat-option>
                }
              </mat-select>
              <mat-error>Rola jest wymagana</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data ważności szkolenia</mat-label>
              <input matInput [matDatepicker]="trainingPicker" formControlName="trainingValidUntil">
              <mat-datepicker-toggle matIconSuffix [for]="trainingPicker"></mat-datepicker-toggle>
              <mat-datepicker #trainingPicker></mat-datepicker>
              <mat-error>Data szkolenia jest wymagana</mat-error>
            </mat-form-field>

            @if (isPilotRole()) {
              <mat-form-field appearance="outline">
                <mat-label>Nr licencji pilota</mat-label>
                <input matInput formControlName="pilotLicenseNumber" maxlength="30">
                <mat-error>Nr licencji jest wymagany dla pilota</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Data ważności licencji</mat-label>
                <input matInput [matDatepicker]="licensePicker" formControlName="licenseValidUntil">
                <mat-datepicker-toggle matIconSuffix [for]="licensePicker"></mat-datepicker-toggle>
                <mat-datepicker #licensePicker></mat-datepicker>
                <mat-error>Data licencji jest wymagana dla pilota</mat-error>
              </mat-form-field>
            }
          </div>

          @if (canEdit()) {
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">Anuluj</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                {{ isEditMode() ? 'Zapisz zmiany' : 'Utwórz' }}
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
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; padding: 16px 0; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid v.$border-color; }
    button[mat-raised-button] { background-color: v.$primary-navy !important; }
  `]
})
export class CrewMemberFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CrewMemberService);
  private dictService = inject(DictionaryService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  crewRoles = signal<DictionaryItem[]>([]);
  private memberId?: number;

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    weightKg: [70, [Validators.required, Validators.min(30), Validators.max(200)]],
    roleId: [0 as number, Validators.required],
    pilotLicenseNumber: [''],
    licenseValidUntil: [null as Date | null],
    trainingValidUntil: [null as Date | null, Validators.required]
  });

  ngOnInit(): void {
    this.dictService.getCrewRoles().subscribe(roles => this.crewRoles.set(roles));

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.memberId = +id;
      this.loading.set(true);
      this.service.getById(this.memberId).subscribe({
        next: m => {
          this.form.patchValue({
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            weightKg: m.weightKg,
            roleId: m.roleId,
            pilotLicenseNumber: m.pilotLicenseNumber ?? '',
            licenseValidUntil: m.licenseValidUntil ? new Date(m.licenseValidUntil) : null,
            trainingValidUntil: m.trainingValidUntil ? new Date(m.trainingValidUntil) : null
          });
          if (!this.canEdit()) this.form.disable();
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.notification.showError('Nie znaleziono członka załogi'); }
      });
    }
  }

  canEdit(): boolean { return this.authService.hasRole(ROLES.ADMIN); }

  isPilotRole(): boolean {
    const roleId = this.form.get('roleId')?.value;
    const pilotRole = this.crewRoles().find(r => r.name === 'Pilot');
    return roleId === pilotRole?.id;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.canEdit()) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    const request = {
      firstName: val.firstName,
      lastName: val.lastName,
      email: val.email,
      weightKg: val.weightKg,
      roleId: val.roleId,
      trainingValidUntil: val.trainingValidUntil ? this.formatDate(val.trainingValidUntil) : '',
      ...(this.isPilotRole() ? {
        pilotLicenseNumber: val.pilotLicenseNumber,
        licenseValidUntil: val.licenseValidUntil ? this.formatDate(val.licenseValidUntil) : undefined
      } : {})
    };

    const obs = this.isEditMode()
      ? this.service.update(this.memberId!, request)
      : this.service.create(request);

    obs.subscribe({
      next: () => { this.notification.showSuccess(this.isEditMode() ? 'Członek załogi zaktualizowany' : 'Członek załogi utworzony'); this.router.navigate(['/admin/crew-members']); },
      error: (err) => { this.saving.set(false); this.notification.showApiError(err); }
    });
  }

  goBack(): void { this.router.navigate(['/admin/crew-members']); }
  private formatDate(date: Date): string { return date.toISOString().split('T')[0]; }
}
