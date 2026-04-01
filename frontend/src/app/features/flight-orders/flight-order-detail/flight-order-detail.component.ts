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
  templateUrl: './flight-order-detail.component.html',
  styleUrl: './flight-order-detail.component.scss'
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
