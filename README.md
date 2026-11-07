# NATS JetStream Observability UI

Angular read-only monitoring UI for NATS Server and JetStream. The application consumes the NATS monitoring endpoints `/healthz`, `/varz`, `/jsz`, and `/connz`; it does not create or mutate streams, consumers, messages, or server configuration.

## Development

Install dependencies and start the Angular development server:

```bash
npm ci
npm start
```

The UI is available at `http://localhost:4200`. Development requests under `/monitoring` are proxied to `http://127.0.0.1:18222`. Establish a protected local tunnel first, for example:

```bash
ssh -N -L 18222:127.0.0.1:8222 <operator>@<nats-host>
```

Replace the placeholders with the approved SSH access path. Do not expose NATS monitoring port `8222` directly to the public network or LAN. The monitoring HTTP surface does not provide an independent authentication boundary, so use an SSH tunnel or an appropriately protected proxy.

The browser-facing base URL is configured in `src/assets/runtime-config.json`. For a reverse proxy or another local path, set `monitoringBaseUrl` to an absolute URL or path and keep the NATS monitoring listener behind that protected boundary.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

The repository does not currently define an ESLint configuration; `typecheck`, unit tests, and the Angular production build are the available static gates.

## Docker

The image serves the compiled UI with nginx. Set the browser-facing monitoring path or URL at container startup:

```bash
docker run --rm -p 4200:80 \\
  -e MONITORING_BASE_URL=/monitoring \\
  xjitu/nats-ui:<tag>
```

The container does not open, configure, or tunnel port `8222`. Supply `/monitoring` through a protected reverse proxy when the UI is deployed beyond local development.

## Scope

The UI is an observability surface only. NATS deployment, listener configuration, network exposure, SSH access, and reverse-proxy policy remain owned by the infrastructure repository and operational environment.

## License

This project is licensed under the [MIT License](LICENSE).
