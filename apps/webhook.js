import Express from 'express';

import { client as lineClient, lineMiddleware } from '#utils/lineBot.js'
import { translate, checkTranslationUsage } from '#utils/translation.js'
import { LINE_CHANNEL_CONFIG, MSG_KEYWORD_LIST } from '#constants/index.js';

const apiWebhook = Express.Router();

// register a webhook handler with middleware
// about the middleware, please refer to doc
apiWebhook.post('/translate',
    lineMiddleware(LINE_CHANNEL_CONFIG),
    (req, res) => {
        Promise
            .all(req.body.events.map(handleEvent))
            .then((result) => res.json(result))
            .catch((err) => {
                console.error(err);
                res.status(500).end();
            });
    }
);

// event handler
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    // check usage
    if (event.message.text === MSG_KEYWORD_LIST.USAGE) {
        const usageMsg = await checkTranslationUsage();

        return await lineClient.replyMessage({
            replyToken: event.replyToken,
            messages: [{ type: 'text', text: usageMsg }],
        });
    }

    // check available language code
    if (event.message.text === MSG_KEYWORD_LIST.LANGUAGE) {
        // TODO
    }

    // get help
    if (event.message.text === MSG_KEYWORD_LIST.HELP) {
        // TODO
    }

    const _text = await translate(event.message.text)
    // use reply API
    return await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: _text }],
    });
}

export default apiWebhook;