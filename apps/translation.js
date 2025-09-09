import Express from 'express';
import { safeTranslate , getSupportLangs } from '#utils/translate.js';

const apiTranslate = Express.Router().use(Express.json());

apiTranslate.get('/languages',
    (req, res) => {
        Promise.resolve(getSupportLangs()).then((result => res.json(result)))
    }
);
apiTranslate.post('/',
    (req, res) => {
        const { text, lang: userTragetLang } = req.body;
        Promise.resolve(safeTranslate({ text, userTragetLang })).then((result => res.json(result)))
    }
);

export default apiTranslate;