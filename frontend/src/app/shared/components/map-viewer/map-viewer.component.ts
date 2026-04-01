import { Component, input, effect, ElementRef, viewChild, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'];
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  icon?: 'start' | 'end' | 'default';
}

@Component({
  selector: 'app-map-viewer',
  standalone: true,
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.scss'
})
export class MapViewerComponent implements OnDestroy {
  points = input<MapPoint[]>([]);
  markers = input<MapMarker[]>([]);
  mapContainer = viewChild.required<ElementRef>('mapContainer');

  private map?: L.Map;
  private layerGroup = L.layerGroup();

  constructor() {
    effect(() => {
      const container = this.mapContainer();
      if (container && !this.map) {
        this.initMap(container.nativeElement);
      }
      this.updateMap();
    });
  }

  private initMap(element: HTMLElement): void {
    this.map = L.map(element).setView([52.0, 19.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    this.layerGroup.addTo(this.map);
  }

  private updateMap(): void {
    if (!this.map) return;
    this.layerGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    for (const point of this.points()) {
      const circle = L.circleMarker([point.lat, point.lng], {
        radius: 4,
        color: point.color || '#003064',
        fillColor: point.color || '#48a2ce',
        fillOpacity: 0.7
      });
      if (point.label) {
        circle.bindPopup(point.label);
      }
      circle.addTo(this.layerGroup);
      bounds.push([point.lat, point.lng]);
    }

    for (const marker of this.markers()) {
      const m = L.marker([marker.lat, marker.lng]);
      m.bindPopup(marker.label);
      m.addTo(this.layerGroup);
      bounds.push([marker.lat, marker.lng]);
    }

    if (bounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 14 });
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
