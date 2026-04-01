import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { OperationService } from '../operation.service';
import { DictionaryService } from '../../../core/services/dictionary.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DictionaryItem } from '../../../core/models/dictionary.model';
import { ROLES } from '../../../core/constants';
import { KmlUploadComponent } from '../../../shared/components/kml-upload/kml-upload.component';
import { MapViewerComponent, MapPoint } from '../../../shared/components/map-viewer/map-viewer.component';

@Component({
  selector: 'app-operation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, KmlUploadComponent, MapViewerComponent],
  templateUrl: './operation-form.component.html',
  styleUrl: './operation-form.component.scss'
})
export class OperationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(OperationService);
  private dictService = inject(DictionaryService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  activityTypes = signal<DictionaryItem[]>([]);
  kmlPoints = signal<MapPoint[]>([]);
  private operationId?: number;
  private kmlFile?: File;

  form = this.fb.group({
    orderProjectNumber: ['', [Validators.required, Validators.maxLength(30)]],
    shortDescription: ['', [Validators.required, Validators.maxLength(100)]],
    proposedDateEarliest: [null as Date | null],
    proposedDateLatest: [null as Date | null],
    activityTypeIds: [[] as number[], Validators.required],
    additionalInfo: [''],
    contactPersonEmailsStr: [''],
    plannedDateEarliest: [null as Date | null],
    plannedDateLatest: [null as Date | null],
    postRealizationNotes: ['']
  });

  ngOnInit(): void {
    this.dictService.getActivityTypes().subscribe(t => this.activityTypes.set(t));

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.operationId = +id;
      this.loading.set(true);
      this.service.getById(this.operationId).subscribe({
        next: op => {
          this.form.patchValue({
            orderProjectNumber: op.orderProjectNumber,
            shortDescription: op.shortDescription,
            proposedDateEarliest: op.proposedDateEarliest ? new Date(op.proposedDateEarliest) : null,
            proposedDateLatest: op.proposedDateLatest ? new Date(op.proposedDateLatest) : null,
            activityTypeIds: op.activityTypes.map(a => a.id),
            additionalInfo: op.additionalInfo || '',
            contactPersonEmailsStr: op.contactPersons?.map(c => c.email).join(', ') || '',
            plannedDateEarliest: op.plannedDateEarliest ? new Date(op.plannedDateEarliest) : null,
            plannedDateLatest: op.plannedDateLatest ? new Date(op.plannedDateLatest) : null,
            postRealizationNotes: op.postRealizationNotes || ''
          });
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.notification.showError('Nie znaleziono operacji'); }
      });
    }
  }

  isSupervisor(): boolean { return this.authService.hasRole(ROLES.SUPERVISOR); }

  onKmlFileSelected(file: File): void { this.kmlFile = file; }
  onPointsParsed(points: MapPoint[]): void { this.kmlPoints.set(points); }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (!this.isEditMode() && !this.kmlFile) {
      this.notification.showError('Plik KML jest wymagany');
      return;
    }

    this.saving.set(true);
    const val = this.form.getRawValue();
    const contactEmails = val.contactPersonEmailsStr
      ? val.contactPersonEmailsStr.split(',').map(e => e.trim()).filter(e => e)
      : [];

    const request = {
      orderProjectNumber: val.orderProjectNumber!,
      shortDescription: val.shortDescription!,
      proposedDateEarliest: val.proposedDateEarliest ? this.formatDate(val.proposedDateEarliest) : undefined,
      proposedDateLatest: val.proposedDateLatest ? this.formatDate(val.proposedDateLatest) : undefined,
      activityTypeIds: val.activityTypeIds!,
      additionalInfo: val.additionalInfo || undefined,
      contactPersonEmails: contactEmails.length > 0 ? contactEmails : undefined,
      ...(this.isSupervisor() ? {
        plannedDateEarliest: val.plannedDateEarliest ? this.formatDate(val.plannedDateEarliest) : undefined,
        plannedDateLatest: val.plannedDateLatest ? this.formatDate(val.plannedDateLatest) : undefined,
        postRealizationNotes: val.postRealizationNotes || undefined
      } : {})
    };

    const obs = this.isEditMode()
      ? this.service.update(this.operationId!, request, this.kmlFile)
      : this.service.create(request, this.kmlFile!);

    obs.subscribe({
      next: () => {
        this.notification.showSuccess(this.isEditMode() ? 'Operacja zaktualizowana' : 'Operacja utworzona');
        this.router.navigate(['/operations']);
      },
      error: (err) => { this.saving.set(false); this.notification.showApiError(err); }
    });
  }

  goBack(): void { this.router.navigate(['/operations']); }
  private formatDate(date: Date): string { return date.toISOString().split('T')[0]; }
}
