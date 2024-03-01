import Express from 'express';
import { translate, getSupportLangs } from '#utils/translate.js'

const apiTranslate = Express.Router().use(Express.json());


apiTranslate.post('/languages',
    (req, res) => {
        Promise.resolve(getSupportLangs()).then((result => res.json(result)))
    }
);
apiTranslate.post('/',
    (req, res) => {
        const { text, lang: userTragetLang } = req.body
        Promise.resolve(translate({ text, userTragetLang })).then((result => res.json(result)))
    }
);

export default apiTranslate;