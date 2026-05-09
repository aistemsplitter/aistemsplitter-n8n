import { getSplit } from '../../../shared/aistemsplitter-api.mjs';

export default {
  key: 'aistemsplitter-get-split',
  name: 'Get Split',
  description: 'Get an AIStemSplitter split by id.',
  version: '0.1.0',
  type: 'action',
  props: {
    aistemsplitter: {
      type: 'app',
      app: 'aistemsplitter',
    },
    splitId: {
      type: 'string',
      label: 'Split ID',
    },
  },
  async run() {
    return getSplit({
      apiKey: this.aistemsplitter.$auth.api_key,
      apiBaseUrl: this.aistemsplitter.$auth.api_base_url,
      splitId: this.splitId,
    });
  },
};
