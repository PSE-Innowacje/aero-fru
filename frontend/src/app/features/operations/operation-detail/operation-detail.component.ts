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
  template: `
    @if (loading()) {
      <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
    } @else if (operation()) {
      <div class="page-header">
        <div>
          <h2>Operacja #{{ operation()!.operationNumber }}</h2>
          <p class="subtitle">{{ operation()!.orderProjectNumber }} — {{ operation()!.shortDescription }}</p>
        </div>
        <div class="header-actions">
          <app-status-badge [status]="operation()!.status" />
          @if (canEdit()) {
            <button mat-stroked-button (click)="router.navigate(['/operations', operation()!.id, 'edit'])">
              <mat-icon>edit</mat-icon> Edytuj
            </button>
          }
        </div>
      </div>

      <!-- Status action buttons -->
      @if (showSupervisorActions()) {
        <div class="action-bar">
          <button mat-raised-button class="btn-reject" (click)="changeStatus(OPERATION_STATUSES.REJECTED, 'Odrzucić operację?')">
            <mat-icon>close</mat-icon> Odrzuć
          </button>
          <button mat-raised-button class="btn-confirm" (click)="changeStatus(OPERATION_STATUSES.CONFIRMED, 'Potwierdzić do planu?')">
            <mat-icon>check</mat-icon> Potwierdź do planu
          </button>
        </div>
      }
      @if (showPlannerResignAction()) {
        <div class="action-bar">
          <button mat-raised-button class="btn-resign" (click)="changeStatus(OPERATION_STATUSES.RESIGNED, 'Zrezygnować z operacji?')">
            <mat-icon>block</mat-icon> Rezygnuj
          </button>
        </div>
      }

      <div class="detail-grid">
        <mat-card class="detail-card">
          <h3>Szczegóły</h3>
          <div class="detail-row"><span class="label">Rodzaj czynności:</span><span>{{ (operation()!.activityTypes || []).map(a => a.name).join(', ') }}</span></div>
          <div class="detail-row"><span class="label">Proponowane daty:</span><span>{{ operation()!.proposedDateEarliest | datePl }} – {{ operation()!.proposedDateLatest | datePl }}</span></div>
          <div class="detail-row"><span class="label">Planowane daty:</span><span>{{ operation()!.plannedDateEarliest | datePl }} – {{ operation()!.plannedDateLatest | datePl }}</span></div>
          <div class="detail-row"><span class="label">Km trasy:</span><span>{{ operation()!.routeKm }} km</span></div>
          <div class="detail-row"><span class="label">Osoba wprowadzająca:</span><span>{{ operation()!.createdBy }}</span></div>
          @if (operation()!.additionalInfo) {
            <div class="detail-row"><span class="label">Dodatkowe informacje:</span><span>{{ operation()!.additionalInfo }}</span></div>
          }
          @if (operation()!.contactPersons?.length) {
            <div class="detail-row"><span class="label">Osoby kontaktowe:</span><span>{{ (operation()!.contactPersons || []).map(c => c.email).join(', ') }}</span></div>
          }
          @if (operation()!.postRealizationNotes) {
            <div class="detail-row"><span class="label">Uwagi po realizacji:</span><span>{{ operation()!.postRealizationNotes }}</span></div>
          }
          <button mat-stroked-button (click)="downloadKml()" class="kml-btn">
            <mat-icon>download</mat-icon> Pobierz plik KML
          </button>
        </mat-card>

        <mat-card class="map-card">
          <h3>Mapa</h3>
          <div class="map-container">
            <app-map-viewer [points]="kmlPoints()" />
          </div>
        </mat-card>
      </div>

      <!-- Comments -->
      <mat-card class="section-card">
        <h3>Komentarze</h3>
        @for (comment of operation()!.comments; track comment.id) {
          <div class="comment">
            <div class="comment-header">
              <strong>{{ comment.createdBy }}</strong>
              <span class="comment-date">{{ comment.createdAt | datePl:'datetime' }}</span>
            </div>
            <p>{{ comment.commentText }}</p>
          </div>
        }
        @if (canComment()) {
          <div class="add-comment">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nowy komentarz</mat-label>
              <textarea matInput [formControl]="commentControl" maxlength="500" rows="2"></textarea>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="addComment()" [disabled]="!commentControl.value?.trim()">
              Dodaj komentarz
            </button>
          </div>
        }
      </mat-card>

      <!-- History -->
      <mat-card class="section-card">
        <h3>Historia zmian</h3>
        <table mat-table [dataSource]="history()" class="full-width">
          <ng-container matColumnDef="fieldName">
            <th mat-header-cell *matHeaderCellDef>Pole</th>
            <td mat-cell *matCellDef="let row">{{ row.fieldName }}</td>
          </ng-container>
          <ng-container matColumnDef="oldValue">
            <th mat-header-cell *matHeaderCellDef>Stara wartość</th>
            <td mat-cell *matCellDef="let row">{{ row.oldValue || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="newValue">
            <th mat-header-cell *matHeaderCellDef>Nowa wartość</th>
            <td mat-cell *matCellDef="let row">{{ row.newValue || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="changedBy">
            <th mat-header-cell *matHeaderCellDef>Zmienione przez</th>
            <td mat-cell *matCellDef="let row">{{ row.changedBy }}</td>
          </ng-container>
          <ng-container matColumnDef="changedAt">
            <th mat-header-cell *matHeaderCellDef>Data zmiany</th>
            <td mat-cell *matCellDef="let row">{{ row.changedAt | datePl:'datetime' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="historyColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: historyColumns;"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    @use 'styles/variables' as v;
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; h2 { font-size: 22px; font-weight: 700; color: v.$primary-navy; margin: 0; } .subtitle { font-size: 14px; color: v.$text-muted; margin-top: 4px; } }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .action-bar { display: flex; gap: 12px; margin-bottom: 20px; }
    .btn-reject { background-color: v.$alert-red !important; color: #fff !important; }
    .btn-confirm { background-color: v.$accent-green !important; color: #fff !important; }
    .btn-resign { background-color: v.$text-muted !important; color: #fff !important; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .detail-card, .map-card, .section-card { padding: 20px; h3 { font-size: 16px; font-weight: 700; color: v.$primary-navy; margin-bottom: 16px; } }
    .section-card { margin-bottom: 20px; }
    .detail-row { display: flex; padding: 6px 0; border-bottom: 1px solid #f0f0f0; .label { font-weight: 600; min-width: 180px; color: v.$text-muted; font-size: 13px; } }
    .map-container { height: 300px; border-radius: 6px; overflow: hidden; }
    .kml-btn { margin-top: 16px; }
    .comment { padding: 12px 0; border-bottom: 1px solid #f0f0f0; .comment-header { display: flex; justify-content: space-between; margin-bottom: 4px; } .comment-date { font-size: 12px; color: v.$text-muted; } p { font-size: 14px; margin: 0; } }
    .add-comment { margin-top: 16px; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .full-width { width: 100%; }
    button[mat-raised-button][color="primary"] { background-color: v.$primary-navy !important; }
  `]
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
