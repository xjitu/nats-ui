import { Component } from '@angular/core';
import { map } from 'rxjs';
import { MonitoringSnapshot, NormalizedMonitoringData } from '../models/monitoring';
import { normalizeSnapshot } from '../services/monitoring-mapper';
import { MonitoringClientService } from '../services/monitoring-client.service';

interface ConsumersViewModel { snapshot: MonitoringSnapshot; data: NormalizedMonitoringData; }

@Component({ selector: 'app-consumers', templateUrl: './consumers.component.html', styleUrls: ['./consumers.component.css'] })
export class ConsumersComponent {
  readonly viewModel$ = this.monitoring.snapshot$.pipe(map((snapshot): ConsumersViewModel => ({ snapshot, data: normalizeSnapshot(snapshot) })));
  constructor(private readonly monitoring: MonitoringClientService) {}
  refresh(): void { this.monitoring.refresh(); }
  formatNumber(value?: number | null): string { return value === undefined || value === null ? '—' : new Intl.NumberFormat().format(value); }
}
