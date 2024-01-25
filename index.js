
// 3rd
import { messagingApi, middleware as lineMiddleware } from '@line/bot-sdk';
import Express from 'express';
import * as deepl from 'deepl-node';

// constant
import { LINE_CHANNEL_CONFIG, TRANSLATE_AUTH_TOKEN } from './config.js';

// create LINE SDK client
const { MessagingApiClient } = messagingApi;
const client = new MessagingApiClient({
    channelAccessToken: LINE_CHANNEL_CONFIG.channelAccessToken
});
const translator = new deepl.Translator(TRANSLATE_AUTH_TOKEN.deepL);
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
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    if (event.message.text === "/usage") {
        const usageMsg = await checkTranslationUsage();
        console.log(usageMsg)
        return await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{ type: 'text', text: usageMsg }],
        });
    }

    const _text = await translate(event.message.text)

    // create an echoing text message
    const echo = { type: 'text', text: _text };

    // use reply API
    return await client.replyMessage({
        replyToken: event.replyToken,
        messages: [echo],
    });
}

const translate = async (text) => {
    const result = await translator.translateText(text, null, 'en-US');
    console.log(`translation result: ${result.text}`)
    return result.text;
}

const checkTranslationUsage = async () => {
    const usage = await translator.getUsage();
    let usageSituation = "";

    if (usage.anyLimitReached()) {
        usageSituation = 'Translation limit exceeded.';
    }
    if (usage.character) {
        usageSituation = `Characters: ${usage.character.count} of ${usage.character.limit}`;
    }
    if (usage.document) {
        usageSituation = `Documents: ${usage.document.count} of ${usage.document.limit}`;
    }
    return usageSituation;
}

// listen on port
const port = 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});