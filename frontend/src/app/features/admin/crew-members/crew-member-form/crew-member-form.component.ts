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
  templateUrl: './crew-member-form.component.html',
  styleUrl: './crew-member-form.component.scss'
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
