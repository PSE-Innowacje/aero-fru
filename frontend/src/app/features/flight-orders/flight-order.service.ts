import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../../core/models/pagination.model';
import { FlightOrderListItem, FlightOrder, FlightOrderCreateRequest, FlightOrderUpdateRequest } from '../../core/models/flight-order.model';

@Injectable({ providedIn: 'root' })
export class FlightOrderService {
  private http = inject(HttpClient);
  private apiUrl = '/api/flight-orders';

  getAll(statusId: number, page: number, size: number, sort?: string): Observable<Page<FlightOrderListItem>> {
    let params = new HttpParams()
      .set('statusId', statusId)
      .set('page', page)
      .set('size', size);
    if (sort) params = params.set('sort', sort);
    return this.http.get<Page<FlightOrderListItem>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<FlightOrder> {
    return this.http.get<FlightOrder>(`${this.apiUrl}/${id}`);
  }

  create(request: FlightOrderCreateRequest): Observable<FlightOrder> {
    return this.http.post<FlightOrder>(this.apiUrl, request);
  }

  update(id: number, request: FlightOrderUpdateRequest): Observable<FlightOrder> {
    return this.http.put<FlightOrder>(`${this.apiUrl}/${id}`, request);
  }

  changeStatus(id: number, statusId: number): Observable<FlightOrder> {
    return this.http.patch<FlightOrder>(`${this.apiUrl}/${id}/status`, { statusId });
  }
}
