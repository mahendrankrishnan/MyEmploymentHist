import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmploymentHistory {
  id?: number;
  employer: string;
  from: string;
  to?: string | null;
  desc?: string | null;
  client?: string | null;
  position: string;
  till: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmploymentHistoryService {
  private apiUrl = '/api/employment-history';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmploymentHistory[]> {
    return this.http.get<EmploymentHistory[]>(this.apiUrl);
  }

  getById(id: number): Observable<EmploymentHistory> {
    return this.http.get<EmploymentHistory>(`${this.apiUrl}/${id}`);
  }

  create(history: Omit<EmploymentHistory, 'id' | 'createdAt' | 'updatedAt'>): Observable<EmploymentHistory> {
    return this.http.post<EmploymentHistory>(this.apiUrl, history);
  }

  update(id: number, history: Partial<EmploymentHistory>): Observable<EmploymentHistory> {
    return this.http.put<EmploymentHistory>(`${this.apiUrl}/${id}`, history);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

