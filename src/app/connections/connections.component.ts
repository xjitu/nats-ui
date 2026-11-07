import { Component } from '@angular/core';
import { map } from 'rxjs';
import { MonitoringSnapshot, NormalizedMonitoringData } from '../models/monitoring';
import { normalizeSnapshot } from '../services/monitoring-mapper';
import { MonitoringClientService } from '../services/monitoring-client.service';

interface ConnectionsViewModel { snapshot: MonitoringSnapshot; data: NormalizedMonitoringData; }

@Component({ selector: 'app-connections', templateUrl: './connections.component.html', styleUrls: ['./connections.component.css'] })
export class ConnectionsComponent {
  readonly viewModel$ = this.monitoring.snapshot$.pipe(map((snapshot): ConnectionsViewModel => ({ snapshot, data: normalizeSnapshot(snapshot) })));
  constructor(private readonly monitoring: MonitoringClientService) {}
  refresh(): void { this.monitoring.refresh(); }
  formatNumber(value?: number | null): string { return value === undefined || value === null ? '—' : new Intl.NumberFormat().format(value); }
  formatBytes(value?: number | null): string {
    if (value === undefined || value === null) return '—';
    if (value < 1024) return `${value} B`;
    const units = ['KiB', 'MiB', 'GiB', 'TiB']; let amount = value; let unit = 'B';
    for (const nextUnit of units) { amount /= 1024; unit = nextUnit; if (amount < 1024) break; }
    return `${amount.toFixed(amount >= 10 ? 0 : 1)} ${unit}`;
  }
}
