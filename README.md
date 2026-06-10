# secops-cli

Run configurable SecOps HTTP tool actions from simple YAML files.

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
npx secops-cli abuseipdb check_ip --ip 1.2.3.4 --config-path ./my-secops-tools
```

## Tool YAML schema

```yaml
provider: urlhaus
name: URLhaus
description: Public URL malware intelligence lookups.
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
      headers:
        Content-Type: application/x-www-form-urlencoded
      body:
        url: "${args.url}"
```

Supported argument types are `string`, `number`, and `boolean`.

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
