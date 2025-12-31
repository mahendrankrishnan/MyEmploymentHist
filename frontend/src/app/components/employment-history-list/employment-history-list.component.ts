import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmploymentHistoryService, EmploymentHistory } from '../../services/employment-history.service';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';

type SortField = 'employer' | 'position' | 'from' | 'to' | 'client' | null;
type SortDirection = 'asc' | 'desc';

interface ClientGroup {
  clientName: string;
  histories: EmploymentHistory[];
}

interface EmployerGroup {
  employerName: string;
  clientGroups: ClientGroup[];
}

@Component({
  selector: 'app-employment-history-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employment-history-list.component.html',
  styleUrl: './employment-history-list.component.css'
})
export class EmploymentHistoryListComponent implements OnInit {
  allHistories: EmploymentHistory[] = [];
  filteredHistories: EmploymentHistory[] = [];
  groupedHistories: EmployerGroup[] = [];
  loading = true;

  // Filter properties
  filterEmployer = '';
  filterPosition = '';
  filterStatus = '';

  // Sort properties
  sortField: SortField = null;
  sortDirection: SortDirection = 'asc';

  // Expand/Collapse state for employers
  expandedEmployers = new Set<string>();

  constructor(
    private employmentHistoryService: EmploymentHistoryService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit() {
    this.loadEmploymentHistories();
  }

  // Expand/Collapse methods
  toggleEmployer(employerName: string) {
    if (this.expandedEmployers.has(employerName)) {
      this.expandedEmployers.delete(employerName);
    } else {
      this.expandedEmployers.add(employerName);
    }
  }

  isEmployerExpanded(employerName: string): boolean {
    return this.expandedEmployers.has(employerName);
  }

  // Initialize all employers as expanded when data is loaded
  // Preserves existing expanded state for employers that still exist after filtering
  initializeExpandedState() {
    this.groupedHistories.forEach(employerGroup => {
      // Only add if not already in the set (preserves user's expand/collapse choices)
      if (!this.expandedEmployers.has(employerGroup.employerName)) {
        this.expandedEmployers.add(employerGroup.employerName);
      }
    });
  }

      loadEmploymentHistories() {
        this.loading = true;
        this.employmentHistoryService.getAll().subscribe({
          next: (data) => {
            this.allHistories = data;
            this.applyFilters();
            this.initializeExpandedState(); // Initialize expanded state after grouping
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading employment histories:', error);
            this.loading = false;
            alert('Failed to load employment history. Please make sure the backend server is running.');
          }
        });
      }

  applyFilters() {
    let filtered = [...this.allHistories];

    // Filter by employer
    if (this.filterEmployer) {
      filtered = filtered.filter(h => 
        h.employer.toLowerCase().includes(this.filterEmployer.toLowerCase())
      );
    }

    // Filter by position
    if (this.filterPosition) {
      filtered = filtered.filter(h => 
        h.position.toLowerCase().includes(this.filterPosition.toLowerCase())
      );
    }

    // Filter by status
    if (this.filterStatus) {
      if (this.filterStatus === 'current') {
        filtered = filtered.filter(h => h.till === true);
      } else if (this.filterStatus === 'past') {
        filtered = filtered.filter(h => h.till === false);
      }
    }

    this.filteredHistories = filtered;
    this.applySorting();
    this.groupHistories();
  }

  // Helper method to get the latest date for sorting (considers both from and to dates)
  getLatestDate(history: EmploymentHistory): number {
    const fromDate = new Date(history.from).getTime();
    // For current employment (till = true), use a future date to prioritize it
    const toDate = history.till ? new Date('9999-12-31').getTime() : (history.to ? new Date(history.to).getTime() : fromDate);
    // Return the later of the two dates (or from date if to is earlier, which shouldn't happen)
    return Math.max(fromDate, toDate);
  }

  // Helper method to get the latest date from a group of histories
  getLatestDateFromGroup(histories: EmploymentHistory[]): number {
    if (histories.length === 0) return 0;
    return Math.max(...histories.map(h => this.getLatestDate(h)));
  }

  groupHistories() {
    const groupedMap = new Map<string, Map<string, EmploymentHistory[]>>();

    // Group by employer, then by client
    this.filteredHistories.forEach(history => {
      const employer = history.employer || 'Unknown Employer';
      const client = history.client || 'No Client';

      if (!groupedMap.has(employer)) {
        groupedMap.set(employer, new Map<string, EmploymentHistory[]>());
      }

      const clientMap = groupedMap.get(employer)!;
      if (!clientMap.has(client)) {
        clientMap.set(client, []);
      }

      clientMap.get(client)!.push(history);
    });

    // Convert to array structure and sort by date (descending - latest first)
    this.groupedHistories = Array.from(groupedMap.entries())
      .map(([employerName, clientMap]) => {
        const clientGroups: ClientGroup[] = Array.from(clientMap.entries())
          .map(([clientName, histories]) => ({
            clientName,
            histories: histories.sort((a, b) => {
              // Sort by latest date (most recent first - descending)
              const dateA = this.getLatestDate(a);
              const dateB = this.getLatestDate(b);
              return dateB - dateA;
            })
          }))
          .sort((a, b) => {
            // Sort client groups by their latest employment date (descending)
            const latestDateA = this.getLatestDateFromGroup(a.histories);
            const latestDateB = this.getLatestDateFromGroup(b.histories);
            if (latestDateA !== latestDateB) {
              return latestDateB - latestDateA; // Descending order
            }
            // If dates are equal, sort "No Client" last, then alphabetically
            if (a.clientName === 'No Client') return 1;
            if (b.clientName === 'No Client') return -1;
            return a.clientName.localeCompare(b.clientName);
          });

        return {
          employerName,
          clientGroups
        };
      })
      .sort((a, b) => {
        // Sort employers by their latest employment date (descending)
        const latestDateA = Math.max(...a.clientGroups.map(cg => this.getLatestDateFromGroup(cg.histories)));
        const latestDateB = Math.max(...b.clientGroups.map(cg => this.getLatestDateFromGroup(cg.histories)));
        if (latestDateA !== latestDateB) {
          return latestDateB - latestDateA; // Descending order (latest first)
        }
        // If dates are equal, sort alphabetically
        return a.employerName.localeCompare(b.employerName);
      });
  }

  applySorting() {
    if (!this.sortField) {
      return;
    }

    this.filteredHistories.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortField) {
        case 'employer':
          aValue = a.employer.toLowerCase();
          bValue = b.employer.toLowerCase();
          break;
        case 'position':
          aValue = a.position.toLowerCase();
          bValue = b.position.toLowerCase();
          break;
        case 'from':
          aValue = new Date(a.from).getTime();
          bValue = new Date(b.from).getTime();
          break;
        case 'to':
          // Handle 'Present' (till = true) as future date for sorting
          aValue = a.till ? new Date('9999-12-31').getTime() : (a.to ? new Date(a.to).getTime() : 0);
          bValue = b.till ? new Date('9999-12-31').getTime() : (b.to ? new Date(b.to).getTime() : 0);
          break;
        case 'client':
          aValue = (a.client || '').toLowerCase();
          bValue = (b.client || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    // Regroup after sorting
    this.groupHistories();
    // Preserve expanded state for existing employers, expand new ones
    this.initializeExpandedState();
  }

  sortBy(field: SortField) {
    if (this.sortField === field) {
      // Toggle direction if clicking the same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field and default to ascending
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  clearFilters() {
    this.filterEmployer = '';
    this.filterPosition = '';
    this.filterStatus = '';
    this.sortField = null;
    this.sortDirection = 'asc';
    this.applyFilters();
  }

  deleteHistory(id: number) {
    this.confirmationDialogService.show({
      title: 'Delete Employment History',
      message: 'Are you sure you want to delete this employment history? This action cannot be undone.',
      confirmText: 'Yes',
      cancelText: 'No'
    }).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.employmentHistoryService.delete(id).subscribe({
          next: () => {
            this.loadEmploymentHistories();
          },
          error: (error) => {
            console.error('Error deleting employment history:', error);
            alert('Failed to delete employment history.');
          }
        });
      }
    });
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getTotalCountForEmployer(employerGroup: EmployerGroup): number {
    return employerGroup.clientGroups.reduce((total, clientGroup) => total + clientGroup.histories.length, 0);
  }
}

