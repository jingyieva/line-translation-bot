
import Express from 'express';
// api router
import apiWebhook from '#webhook.js';
import apiTranslate  from '#translation.js';

const app = Express();

app.use('/webhook', apiWebhook);
app.use('/translate', apiTranslate);

// listen on port
const port = 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});