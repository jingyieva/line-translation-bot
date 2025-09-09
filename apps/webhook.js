import Express from 'express';

import { client as lineClient, lineMiddleware } from '#utils/lineBot.js'
import { safeTranslate, getSupportLangs } from '#utils/translate.js'
import { LINE_CHANNEL_CONFIG, MSG_KEYWORD_LIST } from '#constants/index.js';

const apiWebhook = Express.Router();

// register a webhook handler with middleware
// about the middleware, please refer to doc
apiWebhook.post('/translate',
    lineMiddleware(LINE_CHANNEL_CONFIG),
    async (req, res) => {
        try {
            const events = req.body.events || [];
            const results = [];
            for (const ev of events) {
                // 微延遲，幫助避開 per-user throttle
                // 也可依需求調整到 150~300ms
                await new Promise(r => setTimeout(r, 180));
                results.push(await handleEvent(ev));
            }
            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
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
        // TODO
    }

    // check available language code
    if (event.message.text === MSG_KEYWORD_LIST.LANGUAGE) {
        // TODO
        const languages = await getSupportLangs();
        return await lineClient.replyMessage({
            replyToken: event.replyToken,
            messages: [{ type: 'text', text: JSON.stringify(languages) }],
        });
    }

    // get help
    if (event.message.text === MSG_KEYWORD_LIST.HELP) {
        // TODO
    }

    const res = await safeTranslate({ text: event.message.text })
    // use reply API
    return await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: res.text }],
    });
}

export default apiWebhook;