
import Express from 'express';
import { setValue, getValue } from '#utils/cache.js';

const apiCache = Express.Router().use(Express.json());

apiCache.post('/set',
    (req, res) => {
        const { key, value } = req.body;
        Promise.resolve(setValue(key, value)).then((result => res.json({ "msg": "success" })))
    }
);

apiCache.get('/get',
    (req, res) => {
        const { key } = req.body;
        Promise.resolve(getValue(key)).then((result => res.json(result)
        ))
    }
);

export default apiCache;
