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
  template: `
    <div class="page-header">
      <h2>{{ isEditMode() ? 'Edycja lądowiska' : 'Nowe lądowisko' }}</h2>
    </div>

    <mat-card>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <mat-form-field appearance="outline" class="full-span">
              <mat-label>Nazwa</mat-label>
              <input matInput formControlName="name">
              <mat-error>Nazwa jest wymagana</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Szerokość geograficzna</mat-label>
              <input matInput type="number" formControlName="latitude" step="0.000001">
              <mat-error>Wartość -90 do 90</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Długość geograficzna</mat-label>
              <input matInput type="number" formControlName="longitude" step="0.000001">
              <mat-error>Wartość -180 do 180</mat-error>
            </mat-form-field>
          </div>

          <div class="map-preview">
            <app-map-viewer [markers]="mapMarkers()" />
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
    .full-span { grid-column: 1 / -1; }
    .map-preview { height: 300px; margin: 16px 0; border-radius: 6px; overflow: hidden; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid v.$border-color; }
    button[mat-raised-button] { background-color: v.$primary-navy !important; }
  `]
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
