import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
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
