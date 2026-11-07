import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, defer, exhaustMap, filter, forkJoin, interval, map, merge, Observable, of, scan, shareReplay, Subject, switchMap, timeout } from 'rxjs';
import {
  ConnzResponse,
  EndpointState,
  HealthzResponse,
  JszResponse,
  MonitoringError,
  MonitoringSnapshot,
  RuntimeConfig,
  VarzResponse
} from '../models/monitoring';

const DEFAULT_BASE_URL = '/monitoring';
const REQUEST_TIMEOUT_MS = 5_000;
const REFRESH_INTERVAL_MS = 30_000;
const JSZ_QUERY = 'accounts=true&streams=true&consumer=true&config=true&stream_leader_only=true&limit=100';
const CONNZ_QUERY = 'limit=100&state=open&sort=cid';

@Injectable({ providedIn: 'root' })
export class MonitoringClientService {
  private readonly manualRefresh$ = new Subject<void>();
  private readonly config$: Observable<RuntimeConfig> = defer(() =>
    this.http.get<RuntimeConfig>('/assets/runtime-config.json')
  ).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    map((config) => this.validateConfig(config)),
    catchError(() => of({ monitoringBaseUrl: DEFAULT_BASE_URL })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly snapshot$: Observable<MonitoringSnapshot> = merge(
    of(void 0),
    interval(REFRESH_INTERVAL_MS),
    this.manualRefresh$
  ).pipe(
    exhaustMap(() => this.fetchSnapshot()),
    scan((previous, current) => this.mergeStaleData(previous, current), undefined as MonitoringSnapshot | undefined),
    filter((snapshot): snapshot is MonitoringSnapshot => snapshot !== undefined),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private readonly http: HttpClient) {}

  refresh(): void {
    this.manualRefresh$.next();
  }

  getRefreshIntervalMs(): number {
    return REFRESH_INTERVAL_MS;
  }

  private fetchSnapshot(): Observable<MonitoringSnapshot> {
    return this.config$.pipe(
      switchMap((config) => forkJoin({
        health: this.request<HealthzResponse>(config, 'healthz'),
        varz: this.request<VarzResponse>(config, 'varz'),
        jsz: this.request<JszResponse>(config, `jsz?${JSZ_QUERY}`),
        connz: this.request<ConnzResponse>(config, `connz?${CONNZ_QUERY}`)
      }).pipe(
        map((result) => ({
          fetchedAt: new Date().toISOString(),
          ...result
        }))
      )
    ));
  }

  private request<T>(config: RuntimeConfig, path: string): Observable<EndpointState<T>> {
    return this.http.get<T>(this.joinUrl(config.monitoringBaseUrl, path)).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map((data) => ({ data, stale: false })),
      catchError((error: unknown) => of({
        error: this.toMonitoringError(error),
        stale: false
      }))
    );
  }

  private validateConfig(config: RuntimeConfig | null | undefined): RuntimeConfig {
    if (!config?.monitoringBaseUrl || typeof config.monitoringBaseUrl !== 'string') {
      return { monitoringBaseUrl: DEFAULT_BASE_URL };
    }
    const candidate = config.monitoringBaseUrl.trim();
    const isRelativePath = candidate.startsWith('/') && !candidate.startsWith('//');
    const isAbsoluteHttpUrl = /^https?:\/\/[^/]+(?:\/.*)?$/i.test(candidate);
    return isRelativePath || isAbsoluteHttpUrl
      ? { monitoringBaseUrl: candidate }
      : { monitoringBaseUrl: DEFAULT_BASE_URL };
  }

  private joinUrl(baseUrl: string, path: string): string {
    return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  }

  private toMonitoringError(error: unknown): MonitoringError {
    if (error instanceof HttpErrorResponse) {
      return {
        message: error.status === 0 ? 'Monitoring endpoint is unreachable.' : `Monitoring endpoint returned HTTP ${error.status}.`,
        status: error.status
      };
    }
    if (error instanceof Error && error.name === 'TimeoutError') {
      return { message: 'Monitoring endpoint timed out.' };
    }
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'Monitoring endpoint returned an unexpected error.' };
  }

  private mergeStaleData(previous: MonitoringSnapshot | undefined, current: MonitoringSnapshot): MonitoringSnapshot {
    if (!previous) {
      return current;
    }
    return {
      fetchedAt: current.fetchedAt,
      health: this.mergeEndpoint(previous.health, current.health),
      varz: this.mergeEndpoint(previous.varz, current.varz),
      jsz: this.mergeEndpoint(previous.jsz, current.jsz),
      connz: this.mergeEndpoint(previous.connz, current.connz)
    };
  }

  private mergeEndpoint<T>(previous: EndpointState<T>, current: EndpointState<T>): EndpointState<T> {
    if (current.error && previous.data) {
      return { data: previous.data, error: current.error, stale: true };
    }
    return current;
  }
}
