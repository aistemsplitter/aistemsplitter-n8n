import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class AIStemSplitterApi implements ICredentialType {
  name = 'aiStemSplitterApi';
  displayName = 'AIStemSplitter API';
  documentationUrl = 'https://aistemsplitter.org/developers/api';

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.apiBaseUrl}}',
      url: '/credits',
      method: 'GET',
    },
  };

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description:
        'AIStemSplitter API key. Generate one at https://aistemsplitter.org/settings/developer.',
    },
    {
      displayName: 'API Base URL',
      name: 'apiBaseUrl',
      type: 'string',
      default: 'https://api.aistemsplitter.org/v1',
      required: true,
      description: 'Base URL of the AIStemSplitter REST API.',
    },
  ];
}
