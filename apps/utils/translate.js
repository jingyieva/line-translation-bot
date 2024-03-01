import * as deepl from 'deepl-node';
import Translate from '@google-cloud/translate';

import { TRANSLATE_AUTH_TOKEN, GOOGLE_PROJECT_ID } from '#constants/index.js';

const deepLTranslator = new deepl.Translator(TRANSLATE_AUTH_TOKEN.deepL);
const { Translate: TranslationSvc } = Translate.v2;
const googleTranslator = new TranslationSvc({ projectId: GOOGLE_PROJECT_ID, key: TRANSLATE_AUTH_TOKEN.google })

/**
 * [DeepL utils]
 */
const translateByDeepL = async (text) => {
    // deepL
    const result = await deepLTranslator.translateText(text, null, 'en-US');
    console.log(`translation result: ${result.text}`)
    return {
        text: result.text,
    };
}

export const checkTranslationUsage = async () => {
    const usage = await deepLTranslator.getUsage();
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

/**
 * [Google utils]
 */
export const translate = async ({text, userTragetLang = undefined}) => {
    // google
    const res = {};
    let allSupportLangs = getSupportLangs();
    let targetLang = allSupportLangs[`${userTragetLang}`]

    if(!targetLang) {
        const [detections] = await googleTranslator.detect(text);
        if(detections) {
            const firstReliableLang = typeof(detections) === 'array' ? detections[0] : detections;
            if(firstReliableLang.language.indexOf('zh') > -1) {
                targetLang = 'en';
            }
            else if(firstReliableLang.language === 'en') {
                targetLang = 'zh-TW';
            }
            else{
                // default translation to Chinese
                targetLang = "zh-TW";
            }
        }
    }

    const [translation] = await googleTranslator.translate(text, targetLang);
    res.text = translation;
    console.log(`translation result: ${res.text}`)
    return res;
}

export const getSupportLangs = async (lang = undefined) => {
    const [languages] = await googleTranslator.getLanguages();
    const res = languages.reduce((prev, cur) => ({
        ...prev,
        [`${cur.code}`]: cur.name
    }), {});

    return res;
}