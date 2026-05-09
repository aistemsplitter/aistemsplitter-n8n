import {
  createSplit,
  getCredits,
  getSplit,
} from '../../../shared/aistemsplitter-api.mjs';

export class AIStemSplitter {
  description = {
    displayName: 'AIStemSplitter',
    name: 'aiStemSplitter',
    group: ['transform'],
    version: 1,
    description: 'Create and inspect AIStemSplitter audio splits',
    defaults: {
      name: 'AIStemSplitter',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'aiStemSplitterApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        default: 'createSplit',
        options: [
          { name: 'Create Split', value: 'createSplit' },
          { name: 'Get Credits', value: 'getCredits' },
          { name: 'Get Split', value: 'getSplit' },
        ],
      },
      {
        displayName: 'Audio URL',
        name: 'audioUrl',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['createSplit'] } },
      },
      {
        displayName: 'Stem Model',
        name: 'stemModel',
        type: 'options',
        default: '6s',
        options: [
          { name: '4 Stems', value: '4s' },
          { name: '6 Stems', value: '6s' },
        ],
        displayOptions: { show: { operation: ['createSplit'] } },
      },
      {
        displayName: 'Split ID',
        name: 'splitId',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['getSplit'] } },
      },
    ],
  };

  async execute() {
    const items = this.getInputData();
    const credentials = await this.getCredentials('aiStemSplitterApi');
    const returnData = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const operation = this.getNodeParameter('operation', itemIndex);
      const baseConfig = {
        apiKey: credentials.apiKey,
        apiBaseUrl: credentials.apiBaseUrl,
      };
      let data;
      if (operation === 'createSplit') {
        data = await createSplit({
          ...baseConfig,
          audioUrl: this.getNodeParameter('audioUrl', itemIndex),
          stemModel: this.getNodeParameter('stemModel', itemIndex),
          outputFormat: 'mp3',
        });
      } else if (operation === 'getCredits') {
        data = await getCredits(baseConfig);
      } else {
        data = await getSplit({
          ...baseConfig,
          splitId: this.getNodeParameter('splitId', itemIndex),
        });
      }

      returnData.push({ json: data });
    }

    return [returnData];
  }
}
