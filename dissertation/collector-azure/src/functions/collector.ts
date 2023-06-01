import { app, EventGridEvent, InvocationContext } from '@azure/functions';
import { handleResourceEvent } from '../handler';

export async function collector(
  event: EventGridEvent,
  context: InvocationContext
): Promise<void> {
  context.log(`Received event for ${event.subject}`);

  try {
    await handleResourceEvent(
      //@ts-ignore
      event.data,
      event.eventTime,
      event.eventType
    );
  } catch (error) {
    context.error(`Could not handle Azure event: ${error}`);
  }
}

app.eventGrid('collector', {
  handler: collector,
});
