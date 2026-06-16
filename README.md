<img width="1200" height="630" alt="secops-cli" src="https://github.com/user-attachments/assets/5a2709f1-1312-4749-9edd-ba0cdc9088e4" />

# secops-cli

Unified SecOps tool calls from the CLI.

`secops-cli` gives security and operations teams one command-line interface for enrichment, reputation checks, threat intelligence lookups, incident response actions, and workflow automation across common SecOps providers.

## Benefits

- Run many SecOps tools from one consistent CLI.
- Speed up investigations without switching dashboards.
- Standardize repeatable security and operations workflows.
- Keep API-driven actions easy to discover with built-in help.

## Usage

```bash
secops-cli
secops-cli urlhaus --help
secops-cli urlhaus lookup_url --help
secops-cli urlhaus lookup_url --url https://example.com
```

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

## Supported tools

<details>
<summary>Show supported tools</summary>

- AbuseIPDB
- AlertMedia
- ANY.RUN
- Caldera
- Confluence
- CrowdSec CTI
- Datadog
- Elasticsearch
- EmailRep
- Exa
- GoPhish
- Google Maps
- Google Sheets
- HackerOne
- Have I Been Pwned
- Hybrid Analysis
- IPinfo
- Jira
- LeakCheck
- Microsoft Defender for Endpoint
- Microsoft Entra
- Microsoft Sentinel
- Microsoft Teams
- Okta
- Okta OAR
- PagerDuty
- PhishLabs
- Rootly
- SentinelOne
- Splunk
- Sublime Security
- Tenable Security Center
- Terraform Cloud
- ThreatStream
- URLhaus
- urlscan.io
- VirusTotal

</details>

## Development

```bash
bun install
bun run typecheck
bun run lint
bun run test
bun run build
```
