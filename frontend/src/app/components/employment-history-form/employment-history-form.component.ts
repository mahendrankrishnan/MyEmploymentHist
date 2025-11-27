import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EmploymentHistoryService } from '../../services/employment-history.service';

@Component({
  selector: 'app-employment-history-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employment-history-form.component.html',
  styleUrl: './employment-history-form.component.css'
})
export class EmploymentHistoryFormComponent implements OnInit {
  employmentForm: FormGroup;
  isEditMode = false;
  saving = false;
  employmentId: number | null = null;
  originalFormValue: any = null;

  constructor(
    private fb: FormBuilder,
    private employmentHistoryService: EmploymentHistoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.employmentForm = this.fb.group({
      employer: ['', [Validators.required, this.trimValidator]],
      position: ['', [Validators.required, this.trimValidator]],
      client: [''],
      from: ['', Validators.required],
      to: [''],
      till: [false],
      desc: ['']
    }, { validators: this.dateRangeValidator });
  }

  // Custom validator to check for whitespace-only values
  trimValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && typeof control.value === 'string') {
      const trimmed = control.value.trim();
      if (trimmed.length === 0) {
        return { required: true };
      }
    }
    return null;
  }

  // Custom validator to ensure "To" date is after "From" date
  dateRangeValidator(form: AbstractControl): ValidationErrors | null {
    const formGroup = form as FormGroup;
    const from = formGroup.get('from')?.value;
    const to = formGroup.get('to')?.value;
    const till = formGroup.get('till')?.value;

    if (!till && from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      if (toDate < fromDate) {
        formGroup.get('to')?.setErrors({ dateRange: true });
        return { dateRange: true };
      }
    }
    
    // Clear dateRange error if validation passes
    const toControl = formGroup.get('to');
    if (toControl?.hasError('dateRange') && (!from || !to || till)) {
      const errors = toControl.errors;
      if (errors) {
        delete errors['dateRange'];
        toControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
    
    return null;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.employmentId = parseInt(id);
      this.loadEmploymentHistory(this.employmentId);
    }
  }

  loadEmploymentHistory(id: number) {
    this.employmentHistoryService.getById(id).subscribe({
      next: (data) => {
        // Format dates for input fields (YYYY-MM-DD)
        const fromDate = data.from ? new Date(data.from).toISOString().split('T')[0] : '';
        const toDate = data.to ? new Date(data.to).toISOString().split('T')[0] : '';
        
        const formValue = {
          employer: data.employer,
          position: data.position,
          client: data.client || '',
          from: fromDate,
          to: toDate,
          till: data.till,
          desc: data.desc || ''
        };
        
        this.employmentForm.patchValue(formValue);
        // Store original values to compare later
        this.originalFormValue = JSON.stringify(formValue);
      },
      error: (error) => {
        console.error('Error loading employment history:', error);
        alert('Failed to load employment history.');
        this.router.navigate(['/']);
      }
    });
  }

  onTillChange() {
    const tillValue = this.employmentForm.get('till')?.value;
    if (tillValue) {
      this.employmentForm.patchValue({ to: '' });
      // Clear any date range errors when "Till Present" is checked
      this.employmentForm.get('to')?.setErrors(null);
    }
    // Re-validate date range when till changes
    this.employmentForm.updateValueAndValidity();
  }

  hasUnsavedChanges(): boolean {
    if (!this.isEditMode) {
      // For add mode, check if form is dirty
      return this.employmentForm.dirty;
    }
    
    // For edit mode, compare current form value with original
    if (!this.originalFormValue) {
      return false;
    }
    
    const currentFormValue = {
      employer: this.employmentForm.get('employer')?.value || '',
      position: this.employmentForm.get('position')?.value || '',
      client: this.employmentForm.get('client')?.value || '',
      from: this.employmentForm.get('from')?.value || '',
      to: this.employmentForm.get('to')?.value || '',
      till: this.employmentForm.get('till')?.value || false,
      desc: this.employmentForm.get('desc')?.value || ''
    };
    
    return JSON.stringify(currentFormValue) !== this.originalFormValue;
  }

  onCancel(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    if (this.hasUnsavedChanges()) {
      const confirmMessage = 'You have unsaved changes. Do you want to save them before canceling?';
      const userChoice = confirm(confirmMessage + '\n\nClick OK to save, or Cancel to discard changes.');
      
      if (userChoice) {
        // User wants to save
        this.onSubmit();
      } else {
        // User wants to discard changes
        this.navigateAway();
      }
    } else {
      // No unsaved changes, navigate away
      this.navigateAway();
    }
  }

  navigateAway() {
    this.router.navigate(['/']);
  }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(event: BeforeUnloadEvent): boolean {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = '';
      return false;
    }
    return true;
  }

  // Helper method to mark all fields as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper method to get error message for a field
  getErrorMessage(fieldName: string): string {
    const control = this.employmentForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('dateRange')) {
      return 'To date must be after From date';
    }
    return '';
  }

  // Helper method to get field label
  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'employer': 'Employer',
      'position': 'Position',
      'from': 'From date',
      'to': 'To date'
    };
    return labels[fieldName] || fieldName;
  }

  // Helper method to check if field has error
  hasError(fieldName: string): boolean {
    const control = this.employmentForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit() {
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched(this.employmentForm);
    
    // Re-validate the form
    this.employmentForm.updateValueAndValidity();
    
    if (this.employmentForm.valid && !this.saving) {
      this.saving = true;
      const formValue = this.employmentForm.value;
      
      // Trim string values before submission
      const trimmedFormValue = {
        ...formValue,
        employer: formValue.employer?.trim() || '',
        position: formValue.position?.trim() || '',
        client: formValue.client?.trim() || '',
        desc: formValue.desc?.trim() || ''
      };
      
      // Prepare data for API
      const employmentData = {
        employer: trimmedFormValue.employer,
        position: trimmedFormValue.position,
        client: trimmedFormValue.client || null,
        from: trimmedFormValue.from,
        to: trimmedFormValue.till ? null : (trimmedFormValue.to || null),
        till: trimmedFormValue.till || false,
        desc: trimmedFormValue.desc || null
      };

      if (this.isEditMode && this.employmentId) {
        this.employmentHistoryService.update(this.employmentId, employmentData).subscribe({
          next: () => {
            this.originalFormValue = JSON.stringify({
              employer: formValue.employer,
              position: formValue.position,
              client: formValue.client || '',
              from: formValue.from,
              to: formValue.till ? '' : (formValue.to || ''),
              till: formValue.till || false,
              desc: formValue.desc || ''
            });
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error updating employment history:', error);
            alert('Failed to update employment history.');
            this.saving = false;
          }
        });
      } else {
        this.employmentHistoryService.create(employmentData).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error creating employment history:', error);
            alert('Failed to create employment history.');
            this.saving = false;
          }
        });
      }
    }
  }
}

