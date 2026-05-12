# AIStemSplitter n8n Community Node

n8n community node for [AIStemSplitter](https://aistemsplitter.org) — submit an
audio URL, separate it into vocals, drums, bass and other stems, and read the
result inside your n8n workflow.

Published on npm as
[`@aistemsplitter/n8n-nodes-aistemsplitter`](https://www.npmjs.com/package/@aistemsplitter/n8n-nodes-aistemsplitter).

## Operations

| Operation | Description |
| --- | --- |
| **Create Split** | Submit an audio URL to the AIStemSplitter API and start a new stem-splitting job. Returns the job id and queued status. |
| **Get Split** | Look up an existing split job by id and read its status and stem output URLs. |
| **Get Credits** | Return the remaining credit balance on the associated AIStemSplitter account. |

## Install

This node is a [verified n8n community node](https://docs.n8n.io/integrations/community-nodes/installation/).

### Self-hosted n8n

1. Open **Settings → Community Nodes** in your n8n instance.
2. Click **Install** and enter:
   ```
   @aistemsplitter/n8n-nodes-aistemsplitter
   ```
3. Accept the community-node risk prompt and click **Install**.
4. Refresh the workflow editor — the **AIStemSplitter** node appears under
   the **Transform** category in the node picker.

### n8n Cloud

Open **Settings → Community Nodes → Install** and follow the same flow with
the package name above.

## Get an AIStemSplitter API key

1. Create an account at [aistemsplitter.org](https://aistemsplitter.org).
2. Open
   [aistemsplitter.org/settings/developer](https://aistemsplitter.org/settings/developer).
3. Click **Create API key** and copy the value (it starts with `ast_`).
4. Treat the key as a secret — anyone with the key can spend your credits.

## Configure the AIStemSplitter API credential

1. In n8n, open **Credentials → New** and search for **AIStemSplitter API**.
2. Fill in the fields:
   - **API Key** — paste the `ast_…` key from the previous section.
   - **API Base URL** — leave the default `https://api.aistemsplitter.org/v1`
     unless you are pointed at a custom environment.
3. Click **Save**. n8n will run the built-in `GET /credits` test against the
   API to confirm the key works.

## Example: split a song from a URL

The smallest useful workflow has three nodes — a manual trigger, the
**AIStemSplitter** node configured for **Create Split**, and a second
**AIStemSplitter** node configured for **Get Split** to poll the job.

1. Add a **Manual Trigger** (or any other trigger).
2. Add an **AIStemSplitter** node:
   - **Credential**: AIStemSplitter API (set up above).
   - **Operation**: `Create Split`.
   - **Audio URL**: a public URL to your audio file, e.g.
     `https://example.com/song.mp3`.
   - **Stem Model**: `6 Stems (Adds Guitar + Piano)` for the highest detail,
     or `4 Stems` for the classic Vocals/Drums/Bass/Other split.
3. Add a second **AIStemSplitter** node:
   - **Operation**: `Get Split`.
   - **Split ID**: `{{$json.id}}` — references the id returned by the
     **Create Split** node.
4. (Optional) Wrap **Get Split** in a `Wait` + loop until `status === 'succeeded'`
   if you need to block on the result. Splits typically finish in a few
   seconds for short clips.
5. Use the `stems` field on the **Get Split** output to download the resulting
   audio (vocals, drums, bass, guitar, piano, other) and pass it into the next
   step of your workflow (Dropbox upload, Slack notification, etc.).

## Error handling

API failures (4xx/5xx responses, network errors, missing credits) raise an
`NodeApiError`, so HTTP status and the upstream error message surface in the
n8n UI. Enable **Continue On Fail** on the node to push an `{ error }` item
into the output instead of stopping the workflow — useful when batch-processing
many URLs.

## Compatibility

- Node.js 22 or newer
- n8n 1.42 or newer (any version that supports
  [community node verification](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/))

## Resources

- AIStemSplitter site: [aistemsplitter.org](https://aistemsplitter.org)
- API reference: [aistemsplitter.org/developers/api](https://aistemsplitter.org/developers/api)
- API base URL: `https://api.aistemsplitter.org/v1`
- Issues: <https://github.com/aistemsplitter/aistemsplitter-n8n/issues>

## License

MIT
