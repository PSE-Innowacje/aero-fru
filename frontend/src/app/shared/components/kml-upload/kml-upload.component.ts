import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MapPoint } from '../map-viewer/map-viewer.component';

@Component({
  selector: 'app-kml-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="kml-upload">
      <input type="file" accept=".kml" #fileInput (change)="onFileSelected($event)" hidden>
      <button mat-stroked-button (click)="fileInput.click()">
        <mat-icon>upload_file</mat-icon>
        {{ fileName() || 'Wybierz plik KML' }}
      </button>
      @if (pointCount() > 0) {
        <span class="point-info">{{ pointCount() }} punktów</span>
      }
      @if (error()) {
        <span class="error-info">{{ error() }}</span>
      }
    </div>
  `,
  styles: [`
    .kml-upload {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .point-info {
      font-size: 12px;
      color: #4c8832;
      font-weight: 600;
    }

    .error-info {
      font-size: 12px;
      color: #e42518;
    }
  `]
})
export class KmlUploadComponent {
  fileSelected = output<File>();
  pointsParsed = output<MapPoint[]>();

  fileName = signal('');
  pointCount = signal(0);
  error = signal('');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error.set('');
    this.fileName.set(file.name);
    this.fileSelected.emit(file);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const points = this.parseKml(reader.result as string);
        this.pointCount.set(points.length);
        this.pointsParsed.emit(points);
      } catch {
        this.error.set('Błąd parsowania pliku KML');
        this.pointCount.set(0);
      }
    };
    reader.readAsText(file);
  }

  private parseKml(xmlString: string): MapPoint[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const points: MapPoint[] = [];

    const coordElements = doc.getElementsByTagName('coordinates');
    for (let i = 0; i < coordElements.length; i++) {
      const text = coordElements[i].textContent?.trim();
      if (!text) continue;

      const coords = text.split(/\s+/);
      for (const coord of coords) {
        const parts = coord.split(',');
        if (parts.length >= 2) {
          const lng = parseFloat(parts[0]);
          const lat = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            points.push({ lat, lng });
          }
        }
      }
    }

    return points;
  }
}
