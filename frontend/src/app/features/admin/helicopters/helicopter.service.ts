import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HelicopterListItem, Helicopter, HelicopterRequest } from '../../../core/models/helicopter.model';

@Injectable({ providedIn: 'root' })
export class HelicopterService {
  private http = inject(HttpClient);
  private apiUrl = '/api/helicopters';

  getAll(): Observable<HelicopterListItem[]> {
    return this.http.get<HelicopterListItem[]>(this.apiUrl);
  }

  getById(id: number): Observable<Helicopter> {
    return this.http.get<Helicopter>(`${this.apiUrl}/${id}`);
  }

  create(request: HelicopterRequest): Observable<Helicopter> {
    return this.http.post<Helicopter>(this.apiUrl, request);
  }

  update(id: number, request: HelicopterRequest): Observable<Helicopter> {
    return this.http.put<Helicopter>(`${this.apiUrl}/${id}`, request);
  }
}
