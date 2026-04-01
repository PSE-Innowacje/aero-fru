import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../user.service';
import { DictionaryService } from '../../../../core/services/dictionary.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DictionaryItem } from '../../../../core/models/dictionary.model';
import { ROLES } from '../../../../core/constants';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(UserService);
  private dictService = inject(DictionaryService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  userRoles = signal<DictionaryItem[]>([]);
  private userId?: number;

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', Validators.required],
    roleId: [0 as number, Validators.required]
  });

  ngOnInit(): void {
    this.dictService.getUserRoles().subscribe(roles => this.userRoles.set(roles));

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.userId = +id;
      this.loading.set(true);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();

      this.service.getById(this.userId).subscribe({
        next: u => {
          const roleItem = this.userRoles().find(r => r.name === u.role);
          this.form.patchValue({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            roleId: roleItem?.id ?? 0
          });
          if (!this.canEdit()) this.form.disable();
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.notification.showError('Nie znaleziono użytkownika'); }
      });
    }
  }

  canEdit(): boolean { return this.authService.hasRole(ROLES.ADMIN); }

  onSubmit(): void {
    if (this.form.invalid || !this.canEdit()) return;
    this.saving.set(true);
    const val = this.form.getRawValue();

    if (this.isEditMode()) {
      const request = {
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        roleId: val.roleId,
        ...(val.password ? { password: val.password } : {})
      };
      this.service.update(this.userId!, request).subscribe({
        next: () => { this.notification.showSuccess('Użytkownik zaktualizowany'); this.router.navigate(['/admin/users']); },
        error: (err) => { this.saving.set(false); this.notification.showApiError(err); }
      });
    } else {
      this.service.create(val).subscribe({
        next: () => { this.notification.showSuccess('Użytkownik utworzony'); this.router.navigate(['/admin/users']); },
        error: (err) => { this.saving.set(false); this.notification.showApiError(err); }
      });
    }
  }

  goBack(): void { this.router.navigate(['/admin/users']); }
}
