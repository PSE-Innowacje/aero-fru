import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../../core/models/pagination.model';
import { OperationListItem, Operation, OperationCreateRequest, OperationUpdateRequest, Comment, ChangeHistoryEntry } from '../../core/models/operation.model';

@Injectable({ providedIn: 'root' })
export class OperationService {
  private http = inject(HttpClient);
  private apiUrl = '/api/operations';

  getAll(statusId: number, page: number, size: number, sort?: string): Observable<Page<OperationListItem>> {
    let params = new HttpParams()
      .set('statusId', statusId)
      .set('page', page)
      .set('size', size);
    if (sort) params = params.set('sort', sort);
    return this.http.get<Page<OperationListItem>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Operation> {
    return this.http.get<Operation>(`${this.apiUrl}/${id}`);
  }

  create(request: OperationCreateRequest, kmlFile: File): Observable<Operation> {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    formData.append('kmlFile', kmlFile);
    return this.http.post<Operation>(this.apiUrl, formData);
  }

  update(id: number, request: OperationUpdateRequest, kmlFile?: File): Observable<Operation> {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (kmlFile) {
      formData.append('kmlFile', kmlFile);
    }
    return this.http.put<Operation>(`${this.apiUrl}/${id}`, formData);
  }

  changeStatus(id: number, statusId: number): Observable<Operation> {
    return this.http.patch<Operation>(`${this.apiUrl}/${id}/status`, { statusId });
  }

  addComment(id: number, commentText: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${id}/comments`, { commentText });
  }

  getHistory(id: number): Observable<ChangeHistoryEntry[]> {
    return this.http.get<ChangeHistoryEntry[]>(`${this.apiUrl}/${id}/history`);
  }

  downloadKml(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/kml`, { responseType: 'blob' });
  }
}
