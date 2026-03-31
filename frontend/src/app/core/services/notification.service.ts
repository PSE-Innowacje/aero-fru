import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 6000,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showApiError(err: unknown): void {
    const error = err as { error?: { message?: string; violations?: string[]; fieldErrors?: { field: string; message: string }[] } };
    if (error.error?.violations?.length) {
      this.showError(error.error.violations.join('\n'));
    } else if (error.error?.fieldErrors?.length) {
      const messages = error.error.fieldErrors.map(e => `${e.field}: ${e.message}`).join('\n');
      this.showError(messages);
    } else if (error.error?.message) {
      this.showError(error.error.message);
    } else {
      this.showError('Wystąpił nieoczekiwany błąd');
    }
  }
}
