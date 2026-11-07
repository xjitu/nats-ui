import {
  ConnzResponse,
  ConsumerSummary,
  JszResponse,
  MonitoringSnapshot,
  NormalizedMonitoringData,
  NatsAccountDetail,
  NatsConsumerInfo,
  NatsStreamDetail,
  ServerSummary,
  StreamSummary,
  VarzResponse,
  ConnectionSummary
} from '../models/monitoring';

export function normalizeSnapshot(snapshot: MonitoringSnapshot): NormalizedMonitoringData {
  return {
    healthStatus: snapshot.health.data?.status ?? (snapshot.health.error ? 'unavailable' : 'unknown'),
    server: snapshot.varz.data ? normalizeServer(snapshot.varz.data) : undefined,
    jetstream: snapshot.jsz.data ? normalizeJetStream(snapshot.jsz.data, snapshot.varz.data) : undefined,
    streams: normalizeStreams(snapshot.jsz.data),
    consumers: normalizeConsumers(snapshot.jsz.data),
    connections: normalizeConnections(snapshot.connz.data)
  };
}

export function normalizeServer(varz: VarzResponse): ServerSummary {
  return {
    name: varz.server_name,
    id: varz.server_id,
    version: varz.version,
    uptime: varz.uptime,
    memoryBytes: varz.mem,
    cpu: varz.cpu,
    connections: varz.connections,
    subscriptions: varz.subscriptions,
    inMessages: varz.in_msgs,
    outMessages: varz.out_msgs,
    inBytes: varz.in_bytes,
    outBytes: varz.out_bytes,
    slowConsumers: varz.slow_consumers
  };
}

export function normalizeJetStream(jsz: JszResponse, varz?: VarzResponse): NormalizedMonitoringData['jetstream'] {
  return {
    enabled: jsz.disabled === false || (jsz.disabled === undefined && varz?.jetstream !== undefined),
    streams: jsz.streams,
    consumers: jsz.consumers,
    messages: jsz.messages,
    bytes: jsz.bytes,
    memoryBytes: jsz.memory,
    storageBytes: jsz.storage,
    reservedMemoryBytes: jsz.reserved_memory,
    reservedStorageBytes: jsz.reserved_storage,
    apiErrors: jsz.api?.errors,
    metaLeader: jsz.meta_cluster?.leader
  };
}

export function normalizeStreams(jsz?: JszResponse): StreamSummary[] {
  const accounts = Array.isArray(jsz?.account_details)
    ? jsz.account_details.filter((account): account is NatsAccountDetail => Boolean(account && typeof account === 'object'))
    : [];
  return accounts.flatMap((account: NatsAccountDetail) => {
    const streams = Array.isArray(account.stream_detail)
      ? account.stream_detail.filter((stream): stream is NatsStreamDetail => Boolean(stream && typeof stream === 'object'))
      : [];
    return streams.map((stream: NatsStreamDetail) => ({
      account: account.name,
      name: stream.name ?? stream.config?.name ?? 'Unnamed stream',
      subjects: Array.isArray(stream.config?.subjects)
        ? stream.config.subjects.filter((subject): subject is string => typeof subject === 'string')
        : [],
      storage: stream.config?.storage,
      retention: stream.config?.retention,
      replicas: stream.config?.num_replicas,
      created: stream.created,
      messages: stream.state?.messages,
      bytes: stream.state?.bytes,
      firstSequence: stream.state?.first_seq,
      lastSequence: stream.state?.last_seq,
      consumerCount: (Array.isArray(stream.consumer_detail) ? stream.consumer_detail.length : 0)
        + (Array.isArray(stream.direct_consumer_detail) ? stream.direct_consumer_detail.length : 0)
    }));
  });
}

export function normalizeConsumers(jsz?: JszResponse): ConsumerSummary[] {
  const accounts = Array.isArray(jsz?.account_details)
    ? jsz.account_details.filter((account): account is NatsAccountDetail => Boolean(account && typeof account === 'object'))
    : [];
  return accounts.flatMap((account: NatsAccountDetail) => {
    const streams = Array.isArray(account.stream_detail)
      ? account.stream_detail.filter((stream): stream is NatsStreamDetail => Boolean(stream && typeof stream === 'object'))
      : [];
    return streams.flatMap((stream: NatsStreamDetail) => {
      const consumers = [
        ...(Array.isArray(stream.consumer_detail) ? stream.consumer_detail : []),
        ...(Array.isArray(stream.direct_consumer_detail) ? stream.direct_consumer_detail : [])
      ].filter((consumer): consumer is NatsConsumerInfo => Boolean(consumer && typeof consumer === 'object'));
      return consumers.map((consumer: NatsConsumerInfo) => ({
        account: account.name,
        stream: consumer.stream_name ?? stream.name,
        name: consumer.name ?? consumer.config?.durable_name ?? 'Unnamed consumer',
        deliveredStreamSequence: consumer.delivered?.stream_seq,
        acknowledgedStreamSequence: consumer.ack_floor?.stream_seq,
        pending: consumer.num_pending,
        ackPending: consumer.num_ack_pending,
        redelivered: consumer.num_redelivered,
        waiting: consumer.num_waiting,
        paused: consumer.paused === true,
        lastActivity: consumer.delivered?.last_active ?? consumer.ack_floor?.last_active
      }));
    });
  });
}

export function normalizeConnections(connz?: ConnzResponse): ConnectionSummary[] {
  const connections = Array.isArray(connz?.connections)
    ? connz.connections.filter((connection) => Boolean(connection && typeof connection === 'object'))
    : [];
  return connections.map((connection) => ({
    id: connection.cid,
    name: connection.name,
    kind: connection.kind,
    type: connection.type,
    endpoint: connection.ip,
    port: connection.port,
    uptime: connection.uptime,
    idle: connection.idle,
    subscriptions: connection.subscriptions,
    pendingBytes: connection.pending_bytes,
    inMessages: connection.in_msgs,
    outMessages: connection.out_msgs,
    inBytes: connection.in_bytes,
    outBytes: connection.out_bytes,
    language: connection.lang,
    version: connection.version
  }));
}
