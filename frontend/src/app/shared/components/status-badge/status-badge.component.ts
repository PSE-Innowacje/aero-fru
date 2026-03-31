import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="getStatusClass()">{{ status() }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-new { background: #e3f2fd; color: #1565c0; }
    .status-rejected { background: #fce4ec; color: #c62828; }
    .status-confirmed { background: #e8f5e9; color: #2e7d32; }
    .status-planned { background: #fff8e1; color: #f57f17; }
    .status-partial { background: #fff3e0; color: #e65100; }
    .status-completed { background: #e0f2f1; color: #00695c; }
    .status-resigned { background: #f5f5f5; color: #616161; }
    .status-submitted { background: #e8eaf6; color: #283593; }
    .status-accepted { background: #e8f5e9; color: #2e7d32; }
  `]
})
export class StatusBadgeComponent {
  status = input.required<string>();

  getStatusClass(): string {
    const s = this.status();
    if (s === 'Wprowadzone') return 'status-new';
    if (s === 'Odrzucone') return 'status-rejected';
    if (s === 'Potwierdzone do planu') return 'status-confirmed';
    if (s === 'Zaplanowane do zlecenia') return 'status-planned';
    if (s === 'Częściowo zrealizowane' || s === 'Zrealizowane w części') return 'status-partial';
    if (s === 'Zrealizowane' || s === 'Zrealizowane w całości') return 'status-completed';
    if (s === 'Rezygnacja' || s === 'Nie zrealizowane') return 'status-resigned';
    if (s === 'Przekazane do akceptacji') return 'status-submitted';
    if (s === 'Zaakceptowane') return 'status-accepted';
    return 'status-new';
  }
}
