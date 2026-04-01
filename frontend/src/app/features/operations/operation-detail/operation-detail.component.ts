import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DatePlPipe } from '../../../shared/pipes/date-pl.pipe';
import { MapViewerComponent, MapPoint } from '../../../shared/components/map-viewer/map-viewer.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { OperationService } from '../operation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Operation, ChangeHistoryEntry } from '../../../core/models/operation.model';
import { ROLES, OPERATION_STATUSES } from '../../../core/constants';

@Component({
  selector: 'app-operation-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTableModule, MatDividerModule, MatProgressSpinnerModule, StatusBadgeComponent, DatePlPipe, MapViewerComponent],
  templateUrl: './operation-detail.component.html',
  styleUrl: './operation-detail.component.scss'
})
export class OperationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private service = inject(OperationService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  operation = signal<Operation | null>(null);
  history = signal<ChangeHistoryEntry[]>([]);
  kmlPoints = signal<MapPoint[]>([]);
  loading = signal(true);
  commentControl = new FormControl('');
  OPERATION_STATUSES = OPERATION_STATUSES;

  historyColumns = ['fieldName', 'oldValue', 'newValue', 'changedBy', 'changedAt'];

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.service.getById(id).subscribe({
      next: op => {
        this.operation.set(op);
        this.loading.set(false);
        this.loadKmlPoints(id);
      },
      error: () => { this.loading.set(false); this.notification.showError('Nie znaleziono operacji'); }
    });
    this.service.getHistory(id).subscribe(h => this.history.set(h));
  }

  private loadKmlPoints(id: number): void {
    this.service.downloadKml(id).subscribe({
      next: blob => {
        blob.text().then(xml => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(xml, 'application/xml');
          const points: MapPoint[] = [];
          const coordElements = doc.getElementsByTagName('coordinates');
          for (let i = 0; i < coordElements.length; i++) {
            const text = coordElements[i].textContent?.trim();
            if (!text) continue;
            for (const coord of text.split(/\s+/)) {
              const parts = coord.split(',');
              if (parts.length >= 2) {
                const lng = parseFloat(parts[0]);
                const lat = parseFloat(parts[1]);
                if (!isNaN(lat) && !isNaN(lng)) points.push({ lat, lng });
              }
            }
          }
          this.kmlPoints.set(points);
        });
      }
    });
  }

  canEdit(): boolean {
    return this.authService.hasRole(ROLES.PLANNER, ROLES.SUPERVISOR);
  }

  canComment(): boolean {
    return this.authService.hasRole(ROLES.PLANNER, ROLES.SUPERVISOR);
  }

  showSupervisorActions(): boolean {
    return this.authService.hasRole(ROLES.SUPERVISOR) && this.operation()?.statusId === OPERATION_STATUSES.INTRODUCED;
  }

  showPlannerResignAction(): boolean {
    const statusId = this.operation()?.statusId;
    return this.authService.hasRole(ROLES.PLANNER) &&
      (statusId === OPERATION_STATUSES.INTRODUCED || statusId === OPERATION_STATUSES.CONFIRMED || statusId === OPERATION_STATUSES.PLANNED_FOR_ORDER);
  }

  changeStatus(newStatusId: number, message: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Zmiana statusu', message, color: newStatusId === OPERATION_STATUSES.REJECTED ? 'warn' : 'primary' } as ConfirmDialogData
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.service.changeStatus(this.operation()!.id, newStatusId).subscribe({
          next: op => {
            this.operation.set(op);
            this.notification.showSuccess('Status zmieniony');
          },
          error: err => this.notification.showApiError(err)
        });
      }
    });
  }

  addComment(): void {
    const text = this.commentControl.value?.trim();
    if (!text) return;
    this.service.addComment(this.operation()!.id, text).subscribe({
      next: comment => {
        const op = this.operation()!;
        this.operation.set({ ...op, comments: [...op.comments, comment] });
        this.commentControl.reset();
        this.notification.showSuccess('Komentarz dodany');
      },
      error: err => this.notification.showApiError(err)
    });
  }

  downloadKml(): void {
    this.service.downloadKml(this.operation()!.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `operacja_${this.operation()!.operationNumber}.kml`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
