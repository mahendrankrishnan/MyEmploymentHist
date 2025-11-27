import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ConfirmationDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private confirmationSubject = new Subject<ConfirmationDialogData>();
  private resultSubject = new Subject<boolean>();

  show(data: ConfirmationDialogData): Observable<boolean> {
    this.confirmationSubject.next(data);
    return this.resultSubject.asObservable().pipe(take(1));
  }

  getConfirmationData(): Observable<ConfirmationDialogData> {
    return this.confirmationSubject.asObservable();
  }

  confirm(result: boolean) {
    this.resultSubject.next(result);
  }
}

