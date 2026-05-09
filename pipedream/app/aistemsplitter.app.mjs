export default {
  type: 'app',
  app: 'aistemsplitter',
  propDefinitions: {},
  methods: {},
  auth: {
    type: 'keys',
    required: true,
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'string',
        secret: true,
      },
      {
        key: 'api_base_url',
        label: 'API Base URL',
        type: 'string',
        default: 'https://api.aistemsplitter.org/v1',
      },
    ],
  },
};
