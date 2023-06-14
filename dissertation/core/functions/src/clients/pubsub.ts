import { Message, PubSub, Subscription } from '@google-cloud/pubsub';
import { logger } from 'firebase-functions/v2';

export const gcpFeedTopic = 'sap-rti-topic-gcp-feed';
export const inventoryTopic = 'sap-rti-topic-inventory';

export const pubSubClient = new PubSub();

const subscriptions: Map<string, Subscription> = new Map();

export const listen = <T>(
  subscriptionName: string,
  handler: (data: T, messageId: string, publishTime: string) => Promise<void>
) => {
  const s = pubSubClient.subscription(subscriptionName);
  subscriptions.set(subscriptionName, s);
  logger.info(`Listening on ${subscriptionName}`);
  s.on('message', async (m: Message) => {
    logger.debug(`Received message: ${m.id}`);

    try {
      await handler(
        JSON.parse(m.data.toString()) as T,
        m.id,
        m.publishTime.toISOString()
      );
      m.ack();
    } catch (error) {
      logger.warn(`Failed to process message: ${error}`);
    }
  });
};

const gracefulClose = () => {
  for (const s of subscriptions) {
    s[1].removeAllListeners('message');
  }
};

process.on('SIGTERM', gracefulClose);
process.on('SIGINT', gracefulClose);
