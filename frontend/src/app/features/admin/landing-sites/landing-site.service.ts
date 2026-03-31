import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LandingSite, LandingSiteRequest } from '../../../core/models/landing-site.model';

@Injectable({ providedIn: 'root' })
export class LandingSiteService {
  private http = inject(HttpClient);
  private apiUrl = '/api/landing-sites';

  getAll(): Observable<LandingSite[]> {
    return this.http.get<LandingSite[]>(this.apiUrl);
  }

  getById(id: number): Observable<LandingSite> {
    return this.http.get<LandingSite>(`${this.apiUrl}/${id}`);
  }

  create(request: LandingSiteRequest): Observable<LandingSite> {
    return this.http.post<LandingSite>(this.apiUrl, request);
  }

  update(id: number, request: LandingSiteRequest): Observable<LandingSite> {
    return this.http.put<LandingSite>(`${this.apiUrl}/${id}`, request);
  }
}
