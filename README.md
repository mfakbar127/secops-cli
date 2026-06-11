<img width="1200" height="630" alt="secops-cli" src="https://github.com/user-attachments/assets/5a2709f1-1312-4749-9edd-ba0cdc9088e4" />

# secops-cli

Unified SecOps tool calls from the CLI.

`secops-cli` provides a YAML-configurable way to call security and operations tools such as VirusTotal, CrowdStrike, AbuseIPDB, urlscan.io, IPinfo, URLhaus, and more from a single command-line interface.

## Usage

```bash
npx secops-cli
npx secops-cli urlhaus --help
npx secops-cli urlhaus lookup_url --help
npx secops-cli urlhaus lookup_url --url https://example.com
```

`secops-cli` loads YAML tools from the current working directory by default. It first looks for `./tools/*.yml` and `./tools/*.yaml`; if `./tools` does not exist, it loads YAML files from `./`.

Use a custom directory with `--config-path`:

```bash
npx secops-cli abuseipdb lookup_ip_address --ip_address 1.2.3.4 --config-path ./my-secops-tools
```

## Tool YAML schema

```yaml
provider: urlhaus
name: URLhaus
description: Public URL malware intelligence lookups.
http_header:
  Content-Type: application/x-www-form-urlencoded
functions:
  lookup_url:
    description: Look up a URL in URLhaus.
    args:
      url:
        type: string
        required: true
        description: URL to look up.
    request:
      method: POST
      url: https://urlhaus-api.abuse.ch/v1/url/
      body:
        url: "${args.url}"
```

Use root-level `http_header` for headers shared by all functions in the provider. If the same header is also set in a function's `request.headers`, the root-level `http_header` value takes precedence.

Supported argument types are `string`, `number`, and `boolean`.

Supported root tool fields include:

- `provider`
- `name`
- `description`
- `http_header`
- `functions`

Supported request fields are:

- `method`
- `url`
- `headers`
- `query`
- `body`

## Interpolation

Use `${args.name}` for CLI arguments and `${env.NAME}` for environment values.

```yaml
headers:
  Key: "${env.ABUSEIPDB_API_KEY}"
query:
  ipAddress: "${args.ip}"
```

`.env` is loaded automatically from the selected config path when present. System environment variables also work.

## Help

```bash
secops-cli
```

Lists all tools.

```bash
secops-cli urlhaus --help
```

Lists functions for `urlhaus`.

```bash
secops-cli urlhaus lookup_url --help
```

Lists arguments for `lookup_url`.

## Output

Successful requests print the HTTP response body as returned by the provider. Failed HTTP responses include the HTTP status followed by the response body.

## Development

```bash
bun install
bun run typecheck
bun run lint
bun run test
bun run build
```
