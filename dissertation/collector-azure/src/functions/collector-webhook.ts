import {
  app,
  EventGridEvent,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { handleResourceEvent } from '../handler';

export const collectorWebhook = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const eventType = request.headers.get('aeg-event-type');

  switch (eventType) {
    case 'SubscriptionValidation':
      return handleSubscriptionValidation(request);
    case 'Notification':
      return handleNotification(request, context);
    default:
      context.warn(`Function called for unkown event: ${eventType}`);
      return { status: 501 };
  }
};

/**
 * Handle the subscription validation flow described in
 * https://learn.microsoft.com/en-us/azure/event-grid/webhook-event-delivery#endpoint-validation-with-event-grid-events
 */
const handleSubscriptionValidation = async (
  request: HttpRequest
): Promise<HttpResponseInit> => {
  const payload = (await request.json()) as EventGridEvent[];

  if (payload.length !== 1) {
    return { status: 400 };
  }

  const validationResponse = payload[0].data?.validationCode;

  return { jsonBody: { validationResponse } };
};

/**
 * Handle the notification/event sent by Event Grid.
 * The response is based on https://learn.microsoft.com/en-us/azure/event-grid/delivery-and-retry#message-delivery-status
 */
const handleNotification = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const notifications = (await request.json()) as EventGridEvent[];

  for (const n of notifications) {
    context.log(`Received notification for ${n.subject}`);

    try {
      await handleResourceEvent(
        //@ts-ignore
        n.data,
        n.eventTime,
        n.eventType
      );
    } catch (error) {
      context.error(`Could not handle Azure event: ${error}`);
      return { status: 500 };
    }
  }

  return { status: 200 };
};

app.http('collectorWebhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: collectorWebhook,
});
