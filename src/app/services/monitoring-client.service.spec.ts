import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MonitoringClientService } from './monitoring-client.service';
import { connzFixture, healthzFixture, jszFixture, varzFixture } from './monitoring-fixtures';

describe('MonitoringClientService', () => {
  let service: MonitoringClientService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MonitoringClientService]
    });
    service = TestBed.inject(MonitoringClientService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the configured monitoring endpoints with bounded JetStream detail', () => {
    let snapshot: any;
    service.snapshot$.subscribe((value) => snapshot = value);

    http.expectOne('/assets/runtime-config.json').flush({ monitoringBaseUrl: '/protected-monitoring' });
    http.expectOne('/protected-monitoring/healthz').flush(healthzFixture);
    http.expectOne('/protected-monitoring/varz').flush(varzFixture);
    const jszRequest = http.expectOne((request) => request.urlWithParams.startsWith('/protected-monitoring/jsz?'));
    const jszParams = new URLSearchParams(jszRequest.request.urlWithParams.split('?')[1]);
    expect(jszParams.get('accounts')).toBe('true');
    expect(jszParams.get('streams')).toBe('true');
    expect(jszParams.get('consumer')).toBe('true');
    expect(jszParams.get('limit')).toBe('100');
    jszRequest.flush(jszFixture);
    const connzRequest = http.expectOne((request) => request.urlWithParams.startsWith('/protected-monitoring/connz?'));
    const connzParams = new URLSearchParams(connzRequest.request.urlWithParams.split('?')[1]);
    expect(connzParams.get('state')).toBe('open');
    expect(connzParams.get('limit')).toBe('100');
    connzRequest.flush(connzFixture);

    expect(snapshot.varz.data.version).toBe('2.15.2');
    expect(snapshot.jsz.data.streams).toBe(1);
    expect(service.getRefreshIntervalMs()).toBe(30_000);
  });

  it('retains successful endpoint data and marks it stale after a failed refresh', () => {
    const snapshots: any[] = [];
    service.snapshot$.subscribe((value) => snapshots.push(value));

    http.expectOne('/assets/runtime-config.json').flush({ monitoringBaseUrl: '/monitoring' });
    http.expectOne('/monitoring/healthz').flush(healthzFixture);
    http.expectOne('/monitoring/varz').flush(varzFixture);
    http.expectOne((request) => request.urlWithParams.startsWith('/monitoring/jsz?')).flush(jszFixture);
    http.expectOne((request) => request.urlWithParams.startsWith('/monitoring/connz?')).flush(connzFixture);

    service.refresh();
    http.expectOne('/monitoring/healthz').flush({ status: 'ok' });
    http.expectOne('/monitoring/varz').error(new ProgressEvent('error'));
    http.expectOne((request) => request.urlWithParams.startsWith('/monitoring/jsz?')).flush(jszFixture);
    http.expectOne((request) => request.urlWithParams.startsWith('/monitoring/connz?')).flush(connzFixture);

    expect(snapshots.length).toBe(2);
    expect(snapshots[1].varz.data.version).toBe('2.15.2');
    expect(snapshots[1].varz.stale).toBeTrue();
    expect(snapshots[1].varz.error.message).toContain('unreachable');
  });
});
