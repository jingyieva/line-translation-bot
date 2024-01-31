import * as deepl from 'deepl-node';

import { TRANSLATE_AUTH_TOKEN } from '../constants/index.js';

const translator = new deepl.Translator(TRANSLATE_AUTH_TOKEN.deepL);

export const translate = async (text) => {
    const result = await translator.translateText(text, null, 'en-US');
    console.log(`translation result: ${result.text}`)
    return result.text;
}

export const checkTranslationUsage = async () => {
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