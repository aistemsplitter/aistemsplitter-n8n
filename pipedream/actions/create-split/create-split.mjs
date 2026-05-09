import { createSplit } from '../../../shared/aistemsplitter-api.mjs';

export default {
  key: 'aistemsplitter-create-split',
  name: 'Create Split',
  description: 'Create an AIStemSplitter audio split from a direct audio URL.',
  version: '0.1.0',
  type: 'action',
  props: {
    aistemsplitter: {
      type: 'app',
      app: 'aistemsplitter',
    },
    audioUrl: {
      type: 'string',
      label: 'Audio URL',
    },
    stemModel: {
      type: 'string',
      label: 'Stem Model',
      default: '6s',
      options: ['4s', '6s'],
    },
  },
  async run({ $ }) {
    const split = await createSplit({
      apiKey: this.aistemsplitter.$auth.api_key,
      apiBaseUrl: this.aistemsplitter.$auth.api_base_url,
      audioUrl: this.audioUrl,
      stemModel: this.stemModel,
      outputFormat: 'mp3',
    });
    $.export('$summary', `Created split ${split.id}`);
    return split;
  },
};
