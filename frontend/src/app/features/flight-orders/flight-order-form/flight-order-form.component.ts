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
import { MapViewerComponent, MapPoint, MapMarker } from '../../../shared/components/map-viewer/map-viewer.component';
import { FlightOrderService } from '../flight-order.service';
import { HelicopterService } from '../../admin/helicopters/helicopter.service';
import { CrewMemberService } from '../../admin/crew-members/crew-member.service';
import { LandingSiteService } from '../../admin/landing-sites/landing-site.service';
import { OperationService } from '../../operations/operation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HelicopterListItem } from '../../../core/models/helicopter.model';
import { CrewMemberListItem, CrewMember } from '../../../core/models/crew-member.model';
import { LandingSite } from '../../../core/models/landing-site.model';
import { OperationListItem } from '../../../core/models/operation.model';
import { ROLES, OPERATION_STATUSES } from '../../../core/constants';
import { Page } from '../../../core/models/pagination.model';

@Component({
  selector: 'app-flight-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MapViewerComponent],
  templateUrl: './flight-order-form.component.html',
  styleUrl: './flight-order-form.component.scss'
})
export class FlightOrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(FlightOrderService);
  private helicopterService = inject(HelicopterService);
  private crewService = inject(CrewMemberService);
  private landingSiteService = inject(LandingSiteService);
  private operationService = inject(OperationService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isEditMode = signal(false);
  loading = signal(true);
  saving = signal(false);
  activeHelicopters = signal<HelicopterListItem[]>([]);
  pilots = signal<CrewMemberListItem[]>([]);
  allCrew = signal<CrewMemberListItem[]>([]);
  landingSites = signal<LandingSite[]>([]);
  availableOperations = signal<OperationListItem[]>([]);
  crewWeight = signal(0);
  warnings = signal<string[]>([]);
  mapPoints = signal<MapPoint[]>([]);
  mapMarkers = signal<MapMarker[]>([]);
  private orderId?: number;
  private allCrewFull: CrewMember[] = [];

  form = this.fb.group({
    plannedStartDate: [null as Date | null, Validators.required],
    plannedStartTime: ['08:00', Validators.required],
    plannedLandingDate: [null as Date | null, Validators.required],
    plannedLandingTime: ['17:00', Validators.required],
    pilotId: [0 as number, Validators.required],
    helicopterId: [0 as number, Validators.required],
    crewMemberIds: [[] as number[]],
    startLandingSiteId: [0 as number, Validators.required],
    endLandingSiteId: [0 as number, Validators.required],
    operationIds: [[] as number[], Validators.required],
    estimatedRouteKm: [0 as number, Validators.required],
    actualStartDate: [null as Date | null],
    actualStartTime: [''],
    actualLandingDate: [null as Date | null],
    actualLandingTime: ['']
  });

  constructor() {
    this.form.get('crewMemberIds')?.valueChanges.subscribe(() => this.calculateCrewWeight());
    this.form.get('pilotId')?.valueChanges.subscribe(() => this.calculateCrewWeight());
    this.form.get('startLandingSiteId')?.valueChanges.subscribe(() => this.updateMapMarkers());
    this.form.get('endLandingSiteId')?.valueChanges.subscribe(() => this.updateMapMarkers());
  }

  ngOnInit(): void {
    this.loadReferenceData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.orderId = +id;
      this.service.getById(this.orderId).subscribe({
        next: fo => {
          const startDate = new Date(fo.plannedStartAt);
          const landDate = new Date(fo.plannedLandingAt);
          this.form.patchValue({
            plannedStartDate: startDate,
            plannedStartTime: this.formatTime(startDate),
            plannedLandingDate: landDate,
            plannedLandingTime: this.formatTime(landDate),
            pilotId: fo.pilot.id,
            helicopterId: fo.helicopter.id,
            crewMemberIds: fo.crewMembers.map(c => c.id),
            startLandingSiteId: fo.startLandingSite.id,
            endLandingSiteId: fo.endLandingSite.id,
            operationIds: fo.operations.map(o => o.id),
            estimatedRouteKm: fo.estimatedRouteKm,
            actualStartDate: fo.actualStartAt ? new Date(fo.actualStartAt) : null,
            actualStartTime: fo.actualStartAt ? this.formatTime(new Date(fo.actualStartAt)) : '',
            actualLandingDate: fo.actualLandingAt ? new Date(fo.actualLandingAt) : null,
            actualLandingTime: fo.actualLandingAt ? this.formatTime(new Date(fo.actualLandingAt)) : ''
          });
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.notification.showError('Nie znaleziono zlecenia'); }
      });
    } else {
      this.loading.set(false);
    }
  }

  private loadReferenceData(): void {
    this.helicopterService.getAll().subscribe(h => this.activeHelicopters.set(h.filter(x => x.status === 'active')));
    this.crewService.getAll().subscribe(c => {
      this.allCrew.set(c);
      this.pilots.set(c.filter(x => x.role === 'Pilot'));
    });
    this.landingSiteService.getAll().subscribe(s => this.landingSites.set(s));
    this.operationService.getAll(OPERATION_STATUSES.CONFIRMED, 0, 100).subscribe(page => this.availableOperations.set(page.content));
  }

  private calculateCrewWeight(): void {
    const pilotId = this.form.get('pilotId')?.value;
    const crewIds = this.form.get('crewMemberIds')?.value || [];
    let weight = 0;

    for (const member of this.allCrew()) {
      if (member.id === pilotId || crewIds.includes(member.id)) {
        weight += 80; // approximate; full data would need individual fetch
      }
    }
    this.crewWeight.set(weight);
  }

  private updateMapMarkers(): void {
    const markers: MapMarker[] = [];
    const startId = this.form.get('startLandingSiteId')?.value;
    const endId = this.form.get('endLandingSiteId')?.value;

    for (const site of this.landingSites()) {
      if (site.id === startId) markers.push({ lat: site.latitude, lng: site.longitude, label: `Start: ${site.name}`, icon: 'start' });
      if (site.id === endId) markers.push({ lat: site.latitude, lng: site.longitude, label: `Lądowanie: ${site.name}`, icon: 'end' });
    }
    this.mapMarkers.set(markers);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const val = this.form.getRawValue();

    const plannedStartAt = this.combineDatetime(val.plannedStartDate!, val.plannedStartTime!);
    const plannedLandingAt = this.combineDatetime(val.plannedLandingDate!, val.plannedLandingTime!);

    const request = {
      plannedStartAt,
      plannedLandingAt,
      pilotId: val.pilotId!,
      helicopterId: val.helicopterId!,
      crewMemberIds: val.crewMemberIds || [],
      startLandingSiteId: val.startLandingSiteId!,
      endLandingSiteId: val.endLandingSiteId!,
      operationIds: val.operationIds!,
      estimatedRouteKm: val.estimatedRouteKm!,
      ...(this.isEditMode() && val.actualStartDate && val.actualStartTime ? {
        actualStartAt: this.combineDatetime(val.actualStartDate, val.actualStartTime)
      } : {}),
      ...(this.isEditMode() && val.actualLandingDate && val.actualLandingTime ? {
        actualLandingAt: this.combineDatetime(val.actualLandingDate, val.actualLandingTime)
      } : {})
    };

    const obs = this.isEditMode()
      ? this.service.update(this.orderId!, request)
      : this.service.create(request);

    obs.subscribe({
      next: () => {
        this.notification.showSuccess(this.isEditMode() ? 'Zlecenie zaktualizowane' : 'Zlecenie utworzone');
        this.router.navigate(['/flight-orders']);
      },
      error: (err) => { this.saving.set(false); this.notification.showApiError(err); }
    });
  }

  goBack(): void { this.router.navigate(['/flight-orders']); }

  private combineDatetime(date: Date, time: string): string {
    const d = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }

  private formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}
