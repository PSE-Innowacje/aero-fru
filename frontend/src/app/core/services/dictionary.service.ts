import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { DictionaryItem } from '../models/dictionary.model';

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private http = inject(HttpClient);

  private crewRoles$?: Observable<DictionaryItem[]>;
  private userRoles$?: Observable<DictionaryItem[]>;
  private activityTypes$?: Observable<DictionaryItem[]>;
  private operationStatuses$?: Observable<DictionaryItem[]>;
  private flightOrderStatuses$?: Observable<DictionaryItem[]>;

  getCrewRoles(): Observable<DictionaryItem[]> {
    if (!this.crewRoles$) {
      this.crewRoles$ = this.http.get<DictionaryItem[]>('/api/dictionaries/crew-roles').pipe(shareReplay(1));
    }
    return this.crewRoles$;
  }

  getUserRoles(): Observable<DictionaryItem[]> {
    if (!this.userRoles$) {
      this.userRoles$ = this.http.get<DictionaryItem[]>('/api/dictionaries/user-roles').pipe(shareReplay(1));
    }
    return this.userRoles$;
  }

  getActivityTypes(): Observable<DictionaryItem[]> {
    if (!this.activityTypes$) {
      this.activityTypes$ = this.http.get<DictionaryItem[]>('/api/dictionaries/activity-types').pipe(shareReplay(1));
    }
    return this.activityTypes$;
  }

  getOperationStatuses(): Observable<DictionaryItem[]> {
    if (!this.operationStatuses$) {
      this.operationStatuses$ = this.http.get<DictionaryItem[]>('/api/dictionaries/operation-statuses').pipe(shareReplay(1));
    }
    return this.operationStatuses$;
  }

  getFlightOrderStatuses(): Observable<DictionaryItem[]> {
    if (!this.flightOrderStatuses$) {
      this.flightOrderStatuses$ = this.http.get<DictionaryItem[]>('/api/dictionaries/flight-order-statuses').pipe(shareReplay(1));
    }
    return this.flightOrderStatuses$;
  }
}
