import { getCredits } from '../../../shared/aistemsplitter-api.mjs';

export default {
  key: 'aistemsplitter-get-credits',
  name: 'Get Credits',
  description: 'Get the current AIStemSplitter credit balance.',
  version: '0.1.0',
  type: 'action',
  props: {
    aistemsplitter: {
      type: 'app',
      app: 'aistemsplitter',
    },
  },
  async run() {
    return getCredits({
      apiKey: this.aistemsplitter.$auth.api_key,
      apiBaseUrl: this.aistemsplitter.$auth.api_base_url,
    });
  },
};
