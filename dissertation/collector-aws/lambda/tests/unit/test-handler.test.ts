import { PubSub } from '@google-cloud/pubsub';
import { describe, expect, it, jest } from '@jest/globals';
import { handler } from '../../index';
import testEvent from '../../../events/event.json';
import { AssetEvent, Operation } from '../../asset.model';

describe('Unit tests for AWS collector handler', function () {
  it('verifies bucket handling', async () => {
    console.log = jest.fn();

    //@ts-ignore
    await handler(testEvent);

    const expected: AssetEvent = {
      operation: Operation.UPDATE,
      asset: {
        changeTime: new Date('2023-05-28T11:27:21.732Z'),
        deleted: false,
        id: 'arn:aws:s3:::sap-rti-bucket-test-5',
        integration: {
          id: '201157465182',
          provider: 'aws',
        },
        name: 'sap-rti-bucket-test-5',
        providerUrl: '',
        region: 'eu-west-1',
        source: testEvent.detail.configurationItem,
        type: 'AWS::S3::Bucket',
        version: '1.3',
      },
    };

    //@ts-ignore
    const mockInstance = PubSub.mockInstances[0];
    expect(mockInstance.publishMessage).toHaveBeenCalledWith({ json: expected });
  });
});
