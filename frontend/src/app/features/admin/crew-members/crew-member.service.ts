import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrewMemberListItem, CrewMember, CrewMemberRequest } from '../../../core/models/crew-member.model';

@Injectable({ providedIn: 'root' })
export class CrewMemberService {
  private http = inject(HttpClient);
  private apiUrl = '/api/crew-members';

  getAll(): Observable<CrewMemberListItem[]> {
    return this.http.get<CrewMemberListItem[]>(this.apiUrl);
  }

  getById(id: number): Observable<CrewMember> {
    return this.http.get<CrewMember>(`${this.apiUrl}/${id}`);
  }

  create(request: CrewMemberRequest): Observable<CrewMember> {
    return this.http.post<CrewMember>(this.apiUrl, request);
  }

  update(id: number, request: CrewMemberRequest): Observable<CrewMember> {
    return this.http.put<CrewMember>(`${this.apiUrl}/${id}`, request);
  }
}
