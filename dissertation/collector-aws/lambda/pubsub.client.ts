import { PubSub } from '@google-cloud/pubsub';

export const inventoryTopic = 'sap-rti-topic-inventory';

export const pubSubClient = new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
