export class AIStemSplitterApi {
  name = 'aiStemSplitterApi';
  displayName = 'AIStemSplitter API';
  documentationUrl = 'https://aistemsplitter.org/developers/api';

  authenticate = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test = {
    request: {
      baseURL: '={{$credentials.apiBaseUrl}}',
      url: '/credits',
      method: 'GET',
    },
  };

  properties = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
    },
    {
      displayName: 'API Base URL',
      name: 'apiBaseUrl',
      type: 'string',
      default: 'https://api.aistemsplitter.org/v1',
      required: true,
    },
  ];
}
