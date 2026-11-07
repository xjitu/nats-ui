import { ConnzResponse, HealthzResponse, JszResponse, VarzResponse } from '../models/monitoring';

export const healthzFixture: HealthzResponse = { status: 'ok' };

export const varzFixture: VarzResponse = {
  server_id: 'NABC123',
  server_name: 'staging-nats',
  version: '2.15.2',
  uptime: '2h14m3s',
  mem: 104857600,
  cpu: 4.2,
  connections: 3,
  subscriptions: 5,
  in_msgs: 1200,
  out_msgs: 1180,
  in_bytes: 240000,
  out_bytes: 235000,
  slow_consumers: 0,
  jetstream: { config: { max_memory: 134217728, max_storage: 8589934592, store_dir: '/data/jetstream' } }
};

export const jszFixture: JszResponse = {
  server_id: 'NABC123',
  disabled: false,
  accounts: 1,
  streams: 1,
  consumers: 1,
  messages: 42,
  bytes: 4096,
  memory: 0,
  storage: 4096,
  reserved_memory: 134217728,
  reserved_storage: 8589934592,
  api: { level: 1, total: 2, errors: 0, inflight: 0 },
  account_details: [{
    name: '$G',
    streams: 1,
    consumers: 1,
    stream_detail: [{
      name: 'EVENTS',
      created: '2026-11-07T00:00:00Z',
      config: { name: 'EVENTS', subjects: ['events.>'], storage: 'file', retention: 'limits', num_replicas: 1 },
      state: { messages: 42, bytes: 4096, first_seq: 1, last_seq: 42, consumer_count: 1 },
      consumer_detail: [{
        stream_name: 'EVENTS',
        name: 'audit',
        delivered: { consumer_seq: 40, stream_seq: 40, last_active: '2026-11-07T02:00:00Z' },
        ack_floor: { consumer_seq: 39, stream_seq: 39, last_active: '2026-11-07T02:00:00Z' },
        num_ack_pending: 1,
        num_redelivered: 2,
        num_waiting: 0,
        num_pending: 2,
        paused: false
      }]
    }]
  }]
};

export const connzFixture: ConnzResponse = {
  server_id: 'NABC123',
  num_connections: 1,
  total: 1,
  connections: [{
    cid: 7,
    kind: 'Client',
    type: '普通',
    ip: '10.0.0.20',
    port: 50234,
    uptime: '1h2m3s',
    idle: '0s',
    pending_bytes: 0,
    in_msgs: 40,
    out_msgs: 38,
    in_bytes: 8000,
    out_bytes: 7600,
    subscriptions: 2,
    name: 'audit-worker',
    lang: 'go',
    version: '1.0.0'
  }]
};
