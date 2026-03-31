import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DatePlPipe } from '../../../shared/pipes/date-pl.pipe';
import { MapViewerComponent, MapPoint, MapMarker } from '../../../shared/components/map-viewer/map-viewer.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FlightOrderService } from '../flight-order.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FlightOrder } from '../../../core/models/flight-order.model';
import { ROLES, FLIGHT_ORDER_STATUSES } from '../../../core/constants';

@Component({
  selector: 'app-flight-order-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatProgressSpinnerModule, StatusBadgeComponent, DatePlPipe, MapViewerComponent],
  template: `
    @if (loading()) {
      <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
    } @else if (order()) {
      <div class="page-header">
        <div>
          <h2>Zlecenie na lot #{{ order()!.flightOrderNumber }}</h2>
        </div>
        <div class="header-actions">
          <app-status-badge [status]="order()!.status" />
          @if (canEdit()) {
            <button mat-stroked-button (click)="router.navigate(['/flight-orders', order()!.id, 'edit'])">
              <mat-icon>edit</mat-icon> Edytuj
            </button>
          }
        </div>
      </div>

      <!-- Supervisor actions for status=2 -->
      @if (showSupervisorActions()) {
        <div class="action-bar">
          <button mat-raised-button class="btn-reject" (click)="changeStatus(FO_STATUSES.REJECTED, 'Odrzucić zlecenie?')">
            <mat-icon>close</mat-icon> Odrzuć
          </button>
          <button mat-raised-button class="btn-confirm" (click)="changeStatus(FO_STATUSES.ACCEPTED, 'Zaakceptować zlecenie?')">
            <mat-icon>check</mat-icon> Zaakceptuj
          </button>
        </div>
      }

      <!-- Pilot actions for status=4 -->
      @if (showPilotActions()) {
        <div class="action-bar">
          <button mat-raised-button class="btn-partial" (click)="changeStatus(FO_STATUSES.PARTIALLY_COMPLETED, 'Oznaczyć jako zrealizowane w części?')">
            <mat-icon>timelapse</mat-icon> Zrealizowane w części
          </button>
          <button mat-raised-button class="btn-confirm" (click)="changeStatus(FO_STATUSES.FULLY_COMPLETED, 'Oznaczyć jako zrealizowane w całości?')">
            <mat-icon>check_circle</mat-icon> Zrealizowane w całości
          </button>
          <button mat-raised-button class="btn-reject" (click)="changeStatus(FO_STATUSES.NOT_COMPLETED, 'Oznaczyć jako nie zrealizowane?')">
            <mat-icon>cancel</mat-icon> Nie zrealizowane
          </button>
        </div>
      }

      <div class="detail-grid">
        <mat-card class="detail-card">
          <h3>Szczegóły lotu</h3>
          <div class="detail-row"><span class="label">Planowany start:</span><span>{{ order()!.plannedStartAt | datePl:'datetime' }}</span></div>
          <div class="detail-row"><span class="label">Planowane lądowanie:</span><span>{{ order()!.plannedLandingAt | datePl:'datetime' }}</span></div>
          @if (order()!.actualStartAt) {
            <div class="detail-row"><span class="label">Rzeczywisty start:</span><span>{{ order()!.actualStartAt | datePl:'datetime' }}</span></div>
          }
          @if (order()!.actualLandingAt) {
            <div class="detail-row"><span class="label">Rzeczywiste lądowanie:</span><span>{{ order()!.actualLandingAt | datePl:'datetime' }}</span></div>
          }
          <mat-divider></mat-divider>
          <div class="detail-row"><span class="label">Pilot:</span><span>{{ order()!.pilot.firstName }} {{ order()!.pilot.lastName }}</span></div>
          <div class="detail-row"><span class="label">Helikopter:</span><span>{{ order()!.helicopter.registrationNumber }} ({{ order()!.helicopter.helicopterType }})</span></div>
          <div class="detail-row"><span class="label">Waga załogi:</span><span>{{ order()!.crewWeightKg }} kg</span></div>
          <div class="detail-row"><span class="label">Szacowana trasa:</span><span>{{ order()!.estimatedRouteKm }} km</span></div>
          <mat-divider></mat-divider>
          <div class="detail-row"><span class="label">Lądowisko startowe:</span><span>{{ order()!.startLandingSite.name }}</span></div>
          <div class="detail-row"><span class="label">Lądowisko końcowe:</span><span>{{ order()!.endLandingSite.name }}</span></div>

          @if (order()!.crewMembers?.length) {
            <mat-divider></mat-divider>
            <h4>Członkowie załogi</h4>
            @for (member of order()!.crewMembers; track member.id) {
              <div class="crew-member">{{ member.firstName }} {{ member.lastName }} ({{ member.role }})</div>
            }
          }
        </mat-card>

        <mat-card class="map-card">
          <h3>Mapa</h3>
          <div class="map-container">
            <app-map-viewer [points]="mapPoints()" [markers]="mapMarkers()" />
          </div>
        </mat-card>
      </div>

      <!-- Linked operations -->
      <mat-card class="section-card">
        <h3>Powiązane operacje</h3>
        @for (op of order()!.operations; track op.id) {
          <div class="operation-link" (click)="router.navigate(['/operations', op.id])">
            <span class="op-number">#{{ op.operationNumber }}</span>
            <span>{{ op.orderProjectNumber }} — {{ op.shortDescription }}</span>
            <app-status-badge [status]="op.status" />
          </div>
        }
      </mat-card>
    }
  `,
  styles: [`
    @use 'styles/variables' as v;
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; h2 { font-size: 22px; font-weight: 700; color: v.$primary-navy; margin: 0; } }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .action-bar { display: flex; gap: 12px; margin-bottom: 20px; }
    .btn-reject { background-color: v.$alert-red !important; color: #fff !important; }
    .btn-confirm { background-color: v.$accent-green !important; color: #fff !important; }
    .btn-partial { background-color: v.$alert-yellow !important; color: #333 !important; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .detail-card, .map-card, .section-card { padding: 20px; h3 { font-size: 16px; font-weight: 700; color: v.$primary-navy; margin-bottom: 16px; } h4 { font-size: 14px; font-weight: 600; margin: 12px 0 8px; } }
    .section-card { margin-bottom: 20px; }
    .detail-row { display: flex; padding: 6px 0; border-bottom: 1px solid #f0f0f0; .label { font-weight: 600; min-width: 180px; color: v.$text-muted; font-size: 13px; } }
    .map-container { height: 350px; border-radius: 6px; overflow: hidden; }
    .crew-member { padding: 4px 0; font-size: 14px; }
    .operation-link { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer; &:hover { background: #f9f9f9; } .op-number { font-weight: 700; color: v.$primary-navy; } }
    mat-divider { margin: 12px 0; }
  `]
})
export class FlightOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private service = inject(FlightOrderService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  order = signal<FlightOrder | null>(null);
  mapPoints = signal<MapPoint[]>([]);
  mapMarkers = signal<MapMarker[]>([]);
  loading = signal(true);
  FO_STATUSES = FLIGHT_ORDER_STATUSES;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.service.getById(id).subscribe({
      next: fo => {
        this.order.set(fo);
        this.loading.set(false);
        this.buildMap(fo);
      },
      error: () => { this.loading.set(false); this.notification.showError('Nie znaleziono zlecenia'); }
    });
  }

  private buildMap(fo: FlightOrder): void {
    const markers: MapMarker[] = [
      { lat: fo.startLandingSite.latitude, lng: fo.startLandingSite.longitude, label: `Start: ${fo.startLandingSite.name}` },
      { lat: fo.endLandingSite.latitude, lng: fo.endLandingSite.longitude, label: `Lądowanie: ${fo.endLandingSite.name}` }
    ];
    this.mapMarkers.set(markers);
  }

  canEdit(): boolean {
    return this.authService.hasRole(ROLES.PILOT, ROLES.SUPERVISOR);
  }

  showSupervisorActions(): boolean {
    return this.authService.hasRole(ROLES.SUPERVISOR) && this.order()?.statusId === FLIGHT_ORDER_STATUSES.SUBMITTED_FOR_APPROVAL;
  }

  showPilotActions(): boolean {
    return this.authService.hasRole(ROLES.PILOT) && this.order()?.statusId === FLIGHT_ORDER_STATUSES.ACCEPTED;
  }

  changeStatus(newStatusId: number, message: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Zmiana statusu',
        message,
        color: newStatusId === FLIGHT_ORDER_STATUSES.REJECTED || newStatusId === FLIGHT_ORDER_STATUSES.NOT_COMPLETED ? 'warn' : 'primary'
      } as ConfirmDialogData
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.service.changeStatus(this.order()!.id, newStatusId).subscribe({
          next: fo => { this.order.set(fo); this.notification.showSuccess('Status zmieniony'); },
          error: err => this.notification.showApiError(err)
        });
      }
    });
  }
}
