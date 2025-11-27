import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogService, ConfirmationDialogData } from '../../services/confirmation-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
  showDialog = false;
  title = 'Confirm';
  message = '';
  confirmText = 'Yes';
  cancelText = 'No';
  private subscription?: Subscription;

  constructor(private confirmationDialogService: ConfirmationDialogService) {}

  ngOnInit() {
    this.subscription = this.confirmationDialogService.getConfirmationData().subscribe((data: ConfirmationDialogData) => {
      this.title = data.title || 'Confirm';
      this.message = data.message;
      this.confirmText = data.confirmText || 'Yes';
      this.cancelText = data.cancelText || 'No';
      this.showDialog = true;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onConfirm() {
    this.confirmationDialogService.confirm(true);
    this.showDialog = false;
  }

  onCancel() {
    this.confirmationDialogService.confirm(false);
    this.showDialog = false;
  }
}

