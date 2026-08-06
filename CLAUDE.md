## Rules
- Never execute the build command such as npm install, npm build, pip install, etc

## Adding a new tool

Drop a new YAML file into `tools/` — no registry file to edit, it's auto-discovered.

Filename must equal `provider` in snake_case, e.g. `microsoft_entra.yml` → `provider: microsoft_entra`. `provider` must be unique across all files and match `^[a-zA-Z0-9_-]+$`. Before adding, check for collisions: `grep -h '^provider:' tools/*.yml`.

```yaml
provider: <unique-name>        # required
http_header:                    # optional, e.g. auth
  Authorization: "Bearer ${env.SOME_TOKEN}"
functions:
  <function_name>:
    args:
      <arg_name>:
        type: string|number|boolean
        required: true
    request:
      method: GET|POST|PUT|PATCH|DELETE
      url: "https://api.example.com/path/${args.arg_name}"
```

See `tools/abuseipdb.yml` (simple) or `tools/okta.yml` (multi-function) for reference. Add new env vars to `.env.example`, and add the tool to the "Supported tools" list in `README.md`.

If a provider's key is optional upstream (anonymous access works), ship it keyless — the schema can't conditionally include a field, so a required `${env.X}` would break anonymous use. Note it in `TOOLS.md` for later.
