import {
  type IDataObject,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeType,
  type INodeTypeDescription,
  type JsonObject,
  NodeApiError,
} from 'n8n-workflow';

import {
  AIStemSplitterIntegrationError,
  createSplit,
  getCredits,
  getSplit,
} from '../../shared/aistemsplitter-api';

interface CredentialPayload {
  apiKey: string;
  apiBaseUrl: string;
}

export class AIStemSplitter implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'AIStemSplitter',
    name: 'aiStemSplitter',
    icon: 'file:aistemsplitter.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
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
        noDataExpression: true,
        default: 'createSplit',
        options: [
          {
            name: 'Create Split',
            value: 'createSplit',
            action: 'Create a new audio split job',
            description: 'Submit an audio URL and start a stem-splitting job',
          },
          {
            name: 'Get Credits',
            value: 'getCredits',
            action: 'Read remaining credit balance',
            description: 'Return the current AIStemSplitter credit balance',
          },
          {
            name: 'Get Split',
            value: 'getSplit',
            action: 'Get a split by id',
            description: 'Fetch the status and outputs of a split job by id',
          },
        ],
      },
      {
        displayName: 'Audio URL',
        name: 'audioUrl',
        type: 'string',
        default: '',
        required: true,
        placeholder: 'https://example.com/song.mp3',
        description: 'Public URL of the audio file to split',
        displayOptions: { show: { operation: ['createSplit'] } },
      },
      {
        displayName: 'Stem Model',
        name: 'stemModel',
        type: 'options',
        default: '6s',
        options: [
          { name: '4 Stems (Vocals/Drums/Bass/Other)', value: '4s' },
          { name: '6 Stems (Adds Guitar + Piano)', value: '6s' },
        ],
        description: 'Number of stems to produce',
        displayOptions: { show: { operation: ['createSplit'] } },
      },
      {
        displayName: 'Split ID',
        name: 'splitId',
        type: 'string',
        default: '',
        required: true,
        description: 'Id of an existing split job to fetch',
        displayOptions: { show: { operation: ['getSplit'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = (await this.getCredentials(
      'aiStemSplitterApi',
    )) as unknown as CredentialPayload;
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const operation = this.getNodeParameter('operation', itemIndex) as string;
      const baseConfig = {
        apiKey: credentials.apiKey,
        apiBaseUrl: credentials.apiBaseUrl,
      };

      try {
        let data: unknown;
        if (operation === 'createSplit') {
          data = await createSplit({
            ...baseConfig,
            audioUrl: this.getNodeParameter('audioUrl', itemIndex) as string,
            stemModel: this.getNodeParameter('stemModel', itemIndex) as string,
            outputFormat: 'mp3',
          });
        } else if (operation === 'getCredits') {
          data = await getCredits(baseConfig);
        } else if (operation === 'getSplit') {
          data = await getSplit({
            ...baseConfig,
            splitId: this.getNodeParameter('splitId', itemIndex) as string,
          });
        } else {
          throw new Error(`Unsupported operation: ${operation}`);
        }

        returnData.push({ json: data as IDataObject });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: errorToJson(error) },
            pairedItem: { item: itemIndex },
          });
          continue;
        }
        throw toNodeApiError(this.getNode(), error);
      }
    }

    return [returnData];
  }
}

function errorToJson(error: unknown): JsonObject {
  if (error instanceof AIStemSplitterIntegrationError) {
    return {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
    };
  }
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { message: String(error) };
}

function toNodeApiError(
  node: ReturnType<IExecuteFunctions['getNode']>,
  error: unknown,
): NodeApiError {
  if (error instanceof NodeApiError) {
    return error;
  }
  if (error instanceof AIStemSplitterIntegrationError) {
    return new NodeApiError(node, errorToJson(error), {
      message: error.message,
      httpCode: String(error.status || ''),
      description: error.code,
    });
  }
  if (error instanceof Error) {
    return new NodeApiError(
      node,
      { message: error.message },
      { message: error.message },
    );
  }
  return new NodeApiError(node, { message: String(error) });
}
