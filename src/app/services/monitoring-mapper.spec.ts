import { normalizeSnapshot } from './monitoring-mapper';
import { connzFixture, healthzFixture, jszFixture, varzFixture } from './monitoring-fixtures';
import { MonitoringSnapshot } from '../models/monitoring';

describe('monitoring mapper', () => {
  it('normalizes server, JetStream, stream, consumer, and connection payloads', () => {
    const snapshot: MonitoringSnapshot = {
      fetchedAt: '2026-11-07T02:00:00Z',
      health: { data: healthzFixture, stale: false },
      varz: { data: varzFixture, stale: false },
      jsz: { data: jszFixture, stale: false },
      connz: { data: connzFixture, stale: false }
    };

    const result = normalizeSnapshot(snapshot);

    expect(result.healthStatus).toBe('ok');
    expect(result.server?.version).toBe('2.15.2');
    expect(result.jetstream?.enabled).toBeTrue();
    expect(result.jetstream?.messages).toBe(42);
    expect(result.streams[0]).toEqual(jasmine.objectContaining({ name: 'EVENTS', consumerCount: 1 }));
    expect(result.consumers[0]).toEqual(jasmine.objectContaining({ name: 'audit', pending: 2, redelivered: 2 }));
    expect(result.connections[0]).toEqual(jasmine.objectContaining({ id: 7, name: 'audit-worker' }));
  });

  it('returns safe empty collections for a valid empty JetStream response', () => {
    const result = normalizeSnapshot({
      fetchedAt: '2026-11-07T02:00:00Z',
      health: { data: { status: 'ok' }, stale: false },
      varz: { data: { version: '2.15.2' }, stale: false },
      jsz: { data: { disabled: false, streams: 0, consumers: 0, messages: 0, bytes: 0, account_details: [] }, stale: false },
      connz: { data: { connections: [] }, stale: false }
    });

    expect(result.streams).toEqual([]);
    expect(result.consumers).toEqual([]);
    expect(result.connections).toEqual([]);
    expect(result.jetstream?.enabled).toBeTrue();
  });

  it('reports unavailable health without inventing a successful status', () => {
    const result = normalizeSnapshot({
      fetchedAt: '2026-11-07T02:00:00Z',
      health: { error: { message: 'unreachable' }, stale: false },
      varz: { stale: false },
      jsz: { stale: false },
      connz: { stale: false }
    });

    expect(result.healthStatus).toBe('unavailable');
    expect(result.server).toBeUndefined();
  });

  it('keeps malformed collection payloads safe for the presentation layer', () => {
    expect(() => normalizeSnapshot({
      fetchedAt: '2026-11-07T02:00:00Z',
      health: { data: { status: 'ok' }, stale: false },
      varz: { data: {}, stale: false },
      jsz: { data: { account_details: {} as never }, stale: false },
      connz: { data: { connections: {} as never }, stale: false }
    })).not.toThrow();
  });
});
