const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');

require('dotenv').config();

const reviewsRouter = require('./routes/reviews');
const { getQueueClient } = require('./clients/queue');
const { updateReview } = require('./services/review');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.options('*', cors());

app.use('/reviews', reviewsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

// Event handling
const queueClient = getQueueClient(process.env.QUEUE);
setInterval(async () => {
  const response = await queueClient.receiveMessages();
  if (response.receivedMessageItems.length > 0) {
    console.log(`Processing ${response.receivedMessageItems.length} messages`);
  }

  for (const message of response.receivedMessageItems) {
    try {
      const event = JSON.parse(message.messageText);
      switch (event.type) {
        case 'thumbnail-created':
          await updateReview(event.data.id, event.data.thumbnailUrl);
          break;
        default:
          console.error(`Unhandled event type ${event.type}`);
      }
      await queueClient.deleteMessage(message.messageId, message.popReceipt);
    } catch (error) {
      console.error(error);
    }
  }
}, 2000);

module.exports = app;
