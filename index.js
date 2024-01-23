
const line = require('@line/bot-sdk');
// const path = require('path')
const express = require('express');
// const dotenv = require('dotenv');
// dotenv.config({ path: './.env', override: true });
// // dotenv.config();
// console.log(process.env)
// create LINE SDK config from env variables
// const CHANNEL_ACCESS_TOKEN = "vRj0MRLUcnfDF9qVmdvogwZlqTiK2nW05VeWiR8Qyb4lM7pkzVqHJaJyzYHQZPkW/w3ufgiav31hK2LZ4/GloyucKxiyFNM69Oxdl66viD471TFIhZMxFR6VGAGgdrVWfhic3oki5LchGwYJvs/mSQdB04t89/1O/w1cDnyilFU=";
// const CHANNEL_SECRET = "b111f809e69fcd8961a60372f8e370ec";
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  // channelAccessToken: CHANNEL_ACCESS_TOKEN,
  // channelSecret: CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken
});

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/translate', line.middleware(config), (req, res) => {
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