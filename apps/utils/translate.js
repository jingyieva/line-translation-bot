import * as deepl from 'deepl-node';
import { v2 as TranslateV2 } from '@google-cloud/translate';

import { TRANSLATE_AUTH_TOKEN, GOOGLE_PROJECT_ID } from '#constants/index.js';

const deepLTranslator = new deepl.Translator(TRANSLATE_AUTH_TOKEN.deepL);
const googleTranslator = new TranslateV2.Translate({
    projectId: GOOGLE_PROJECT_ID,
    key: TRANSLATE_AUTH_TOKEN.google
});

/**
 * [DeepL utils]
 */
const translateByDeepL = async ({ text, sourceLang = 'ZH-HANT', targetLang = 'EN-US' }) => {
    // deepL
    const result = await deepLTranslator.translateText(text, sourceLang, targetLang);
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

function mapToDeepLTarget(target) {
    if (!target) return 'EN-US';
    const t = target.toLowerCase();
    if (t.startsWith('en')) return 'EN-US';
    if (t.startsWith('zh')) return 'ZH-HANT'; // DeepL 只有 ZH（簡中）
    if (t.startsWith('ja')) return 'JA';
    if (t.startsWith('ko')) return 'KO';
    if (t.startsWith('fr')) return 'FR';
    if (t.startsWith('de')) return 'DE';
    if (t.startsWith('es')) return 'ES';
    if (t.startsWith('it')) return 'IT';
    // 更多可依需要補
    return t.toUpperCase();
}

/**
 * [Google utils]
 */
export async function googleTranslate(text, target) {
    const [res] = await googleTranslator.translate(text, target);
    return Array.isArray(res) ? res[0] : res; // v2 可能回陣列
}

export async function googleDetect(text) {
    const [det] = await googleTranslator.detect(text);
    const lang = Array.isArray(det) ? det[0].language : det.language;
    return lang;
}

export async function googleGetLanguages() {
    const [langs] = await googleTranslator.getLanguages();
    return langs; // [{ language: 'en', name: 'English' }, ...]
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function safeTranslate({ text, target = 'en' }) {
    if (!target) {
        const detected = await googleDetect(text).catch(() => null);
        target = detected && detected.startsWith('zh') ? 'en' : 'zh-TW';
    }
    try {
        const g = await googleTranslate(text, target);
        return { text: g, engine: 'google', target }
    } catch (err) {
        const code = err?.code || err?.status;
        const reason = err?.errors?.[0]?.reason;
        console.error('[google-translate-error]', { code, reason, msg: err?.message });

        // 對 rate/quota/403 再試一次
        if (code === 403 || code === 429 || code === 503 || reason?.includes('Limit')) {
            await sleep(300 + Math.random() * 500);
            try {
                const g2 = await googleTranslate(text, target);
                return { text: gF2, engine: 'google', target };
            } catch (e) {
                console.error('[google-translate-retry-error]', { msg: e?.message });
            }
        }
        try {
            const dlTarget = mapToDeepLTarget(target);
            const result = await deepLTranslator.translateText(text, dlTarget);
            return { text: result.text, engine: 'deepl', target: dlTarget };
        } catch (e2) {
            console.error('[deepl-translate-error]', { msg: e2?.message });
            throw err; // 把原始錯拋回，讓上層決定回覆
        }
    }
}

export async function getSupportLangs() {
    const langs = await googleGetLanguages();
    return langs; // [{ language: 'en', name: 'English' }, ...]
}