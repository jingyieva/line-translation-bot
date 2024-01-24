
// 3rd
import { messagingApi, middleware as lineMiddleware } from '@line/bot-sdk';
import Express from 'express';

// constant
import { LINE_CHANNEL_CONFIG } from './config.js';

// create LINE SDK client
const { MessagingApiClient } = messagingApi;
const client = new MessagingApiClient({
    channelAccessToken: LINE_CHANNEL_CONFIG.channelAccessToken
});

// create Express app
const app = Express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/translate', lineMiddleware(LINE_CHANNEL_CONFIG), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });

});

// event handler
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    // create an echoing text message
    const echo = { type: 'text', text: event.message.text };

    // use reply API
    return client.replyMessage({
        replyToken: event.replyToken,
        messages: [echo],
    });
}

// listen on port
const port = 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});