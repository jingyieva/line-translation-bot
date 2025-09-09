// api/index.js
import Express from 'express';
// api router
import apiWebhook from '#webhook.js';
import apiTranslate  from '#translation.js';

const app = Express();

app.use(
  '/webhook',
  Express.json({
    verify: (req, res, buf) => {
      // 讓 @line/bot-sdk 的 middleware 拿得到 raw body
      req.rawBody = buf;
    },
  }),
  apiWebhook
);
app.use('/translate', apiTranslate);

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Local server on http://localhost:${port}`));
}


export default function handler(req, res) {
  return app(req, res);
}