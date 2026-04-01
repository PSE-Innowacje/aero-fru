import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LandingSiteService } from '../landing-site.service';
import { MapViewerComponent, MapMarker } from '../../../../shared/components/map-viewer/map-viewer.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ROLES } from '../../../../core/constants';

@Component({
  selector: 'app-landing-site-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MapViewerComponent],
  templateUrl: './landing-site-form.component.html',
  styleUrl: './landing-site-form.component.scss'
})
export class LandingSiteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(LandingSiteService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  mapMarkers = signal<MapMarker[]>([]);
  private siteId?: number;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    latitude: [52.0, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [19.5, [Validators.required, Validators.min(-180), Validators.max(180)]]
  });

  constructor() {
    this.form.valueChanges.subscribe(() => this.updateMapMarker());
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.siteId = +id;
      this.loading.set(true);
      this.service.getById(this.siteId).subscribe({
        next: s => {
          this.form.patchValue(s);
          if (!this.canEdit()) this.form.disable();
          this.loading.set(false);
          this.updateMapMarker();
        },
        error: () => { this.loading.set(false); this.notification.showError('Nie znaleziono lądowiska'); }
      });
    } else {
      this.updateMapMarker();
    }
  }

  canEdit(): boolean { return this.authService.hasRole(ROLES.ADMIN); }

  private updateMapMarker(): void {
    const val = this.form.getRawValue();
    if (val.latitude && val.longitude) {
      this.mapMarkers.set([{ lat: val.latitude, lng: val.longitude, label: val.name || 'Lądowisko' }]);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.canEdit()) return;
    this.saving.set(true);
    const request = this.form.getRawValue();

    const obs = this.isEditMode()
      ? this.service.update(this.siteId!, request)
      : this.service.create(request);

    obs.subscribe({
      next: () => { this.notification.showSuccess(this.isEditMode() ? 'Lądowisko zaktualizowane' : 'Lądowisko utworzone'); this.router.navigate(['/admin/landing-sites']); },
      error: (err) => { this.saving.set(false); this.notification.showApiError(err); }
    });
  }

  goBack(): void { this.router.navigate(['/admin/landing-sites']); }
}
