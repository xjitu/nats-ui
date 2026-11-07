export interface RuntimeConfig {
  monitoringBaseUrl: string;
}

export interface HealthzResponse {
  status?: string;
  status_code?: number;
  error?: string;
  errors?: Array<{ code?: string; description?: string }>;
}

export interface NatsJetStreamVarz {
  config?: {
    max_memory?: number;
    max_storage?: number;
    store_dir?: string;
  };
}

export interface VarzResponse {
  server_id?: string;
  server_name?: string;
  version?: string;
  go?: string;
  host?: string;
  port?: number;
  auth_required?: boolean;
  tls_required?: boolean;
  http_host?: string;
  http_port?: number;
  uptime?: string;
  start?: string;
  now?: string;
  mem?: number;
  cpu?: number;
  cores?: number;
  connections?: number;
  total_connections?: number;
  subscriptions?: number;
  in_msgs?: number;
  in_bytes?: number;
  out_msgs?: number;
  out_bytes?: number;
  slow_consumers?: number;
  jetstream?: NatsJetStreamVarz;
}

export interface JszResponse {
  server_id?: string;
  now?: string;
  disabled?: boolean;
  accounts?: number;
  streams?: number;
  streams_leader?: number;
  consumers?: number;
  consumers_leader?: number;
  messages?: number;
  bytes?: number;
  memory?: number;
  storage?: number;
  reserved_memory?: number;
  reserved_storage?: number;
  ha_assets?: number;
  total?: number;
  api?: {
    level?: number;
    total?: number;
    errors?: number;
    inflight?: number;
  };
  meta_cluster?: {
    name?: string;
    leader?: string;
    cluster_size?: number;
    quorum_needed?: number;
  };
  account_details?: NatsAccountDetail[];
}

export interface NatsAccountDetail {
  name?: string;
  id?: string;
  memory?: number;
  storage?: number;
  reserved_memory?: number;
  reserved_storage?: number;
  streams?: number;
  consumers?: number;
  messages?: number;
  bytes?: number;
  stream_detail?: NatsStreamDetail[];
}

export interface NatsStreamDetail {
  name?: string;
  created?: string;
  config?: {
    name?: string;
    subjects?: string[];
    storage?: string;
    retention?: string;
    num_replicas?: number;
    max_consumers?: number;
  };
  state?: {
    messages?: number;
    bytes?: number;
    first_seq?: number;
    last_seq?: number;
    consumer_count?: number;
  };
  consumer_detail?: NatsConsumerInfo[];
  direct_consumer_detail?: NatsConsumerInfo[];
}

export interface NatsConsumerInfo {
  stream_name?: string;
  name?: string;
  created?: string;
  delivered?: NatsSequenceInfo;
  ack_floor?: NatsSequenceInfo;
  num_ack_pending?: number;
  num_redelivered?: number;
  num_waiting?: number;
  num_pending?: number;
  paused?: boolean;
  ts?: string;
  config?: {
    durable_name?: string;
    name?: string;
    ack_policy?: string;
    deliver_policy?: string;
    filter_subject?: string;
    filter_subjects?: string[];
    max_ack_pending?: number;
    deliver_subject?: string;
  };
}

export interface NatsSequenceInfo {
  consumer_seq?: number;
  stream_seq?: number;
  last_active?: string;
}

export interface ConnzResponse {
  server_id?: string;
  now?: string;
  num_connections?: number;
  total?: number;
  offset?: number;
  limit?: number;
  connections?: NatsConnectionInfo[];
}

export interface NatsConnectionInfo {
  cid?: number;
  kind?: string;
  type?: string;
  ip?: string;
  port?: number;
  start?: string;
  last_activity?: string;
  rtt?: string;
  uptime?: string;
  idle?: string;
  pending_bytes?: number;
  in_msgs?: number;
  out_msgs?: number;
  in_bytes?: number;
  out_bytes?: number;
  subscriptions?: number;
  name?: string;
  lang?: string;
  version?: string;
}

export interface MonitoringError {
  message: string;
  status?: number;
}

export interface EndpointState<T> {
  data?: T;
  error?: MonitoringError;
  stale: boolean;
}

export interface MonitoringSnapshot {
  fetchedAt: string;
  health: EndpointState<HealthzResponse>;
  varz: EndpointState<VarzResponse>;
  jsz: EndpointState<JszResponse>;
  connz: EndpointState<ConnzResponse>;
}

export interface ServerSummary {
  name?: string;
  id?: string;
  version?: string;
  uptime?: string;
  memoryBytes?: number;
  cpu?: number;
  connections?: number;
  subscriptions?: number;
  inMessages?: number;
  outMessages?: number;
  inBytes?: number;
  outBytes?: number;
  slowConsumers?: number;
}

export interface JetStreamSummary {
  enabled: boolean;
  streams?: number;
  consumers?: number;
  messages?: number;
  bytes?: number;
  memoryBytes?: number;
  storageBytes?: number;
  reservedMemoryBytes?: number;
  reservedStorageBytes?: number;
  apiErrors?: number;
  metaLeader?: string;
}

export interface StreamSummary {
  account?: string;
  name: string;
  subjects: string[];
  storage?: string;
  retention?: string;
  replicas?: number;
  created?: string;
  messages?: number;
  bytes?: number;
  firstSequence?: number;
  lastSequence?: number;
  consumerCount: number;
}

export interface ConsumerSummary {
  account?: string;
  stream?: string;
  name: string;
  deliveredStreamSequence?: number;
  acknowledgedStreamSequence?: number;
  pending?: number;
  ackPending?: number;
  redelivered?: number;
  waiting?: number;
  paused: boolean;
  lastActivity?: string;
}

export interface ConnectionSummary {
  id?: number;
  name?: string;
  kind?: string;
  type?: string;
  endpoint?: string;
  port?: number;
  uptime?: string;
  idle?: string;
  subscriptions?: number;
  pendingBytes?: number;
  inMessages?: number;
  outMessages?: number;
  inBytes?: number;
  outBytes?: number;
  language?: string;
  version?: string;
}

export interface NormalizedMonitoringData {
  healthStatus: string;
  server?: ServerSummary;
  jetstream?: JetStreamSummary;
  streams: StreamSummary[];
  consumers: ConsumerSummary[];
  connections: ConnectionSummary[];
}
