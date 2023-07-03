import axios from 'axios';
import { ValidationResultFact } from './security';
import { teamWebhook } from '..';

export const sendTeamsNotification = async (
  title: string,
  facts: ValidationResultFact[]
) => {
  const card = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          type: 'AdaptiveCard',
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              text: title,
            },
            {
              type: 'FactSet',
              facts: facts.map((f) => ({
                title: f.asset,
                value: f.message,
              })),
            },
          ],
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          version: '1.3',
        },
      },
    ],
  };

  try {
    await axios.post(teamWebhook.value(), card);
  } catch (error) {
    console.error(`Failed to send teams notifications: ${error}`);
  }
};
