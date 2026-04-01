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
  templateUrl: './helicopter-form.component.html',
  styleUrl: './helicopter-form.component.scss'
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
