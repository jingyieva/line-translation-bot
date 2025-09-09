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
const translateByDeepL = async ({ text, sourceLang = 'ZH', targetLang = 'EN-US' }) => {
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
 * [Google utils] v2
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
    const res = langs.reduce((prev, cur) => ({
        ...prev,
        [`${cur.code}`]: cur.name
    }), {});
    return res; // [{ language: 'en', name: 'English' }, ...]
}

/**
 * [Google Utils] v3
 * @param {*} ms 
 * @returns 
 */
const sa = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
const gTranslateV3 = new TranslationServiceClient({ credentials: sa });

const parent = `projects/${GOOGLE_PROJECT_ID}/locations/global`;

async function googleTranslateV3(text, target) {
  const [resp] = await gTranslateV3.translateText({
    parent,
    contents: [text],
    mimeType: 'text/plain',
    targetLanguageCode: target, // e.g. 'zh-TW', 'en', 'ja'
  });
  return resp?.translations?.[0]?.translatedText || '';
}

async function googleDetectV3(text) {
  const [resp] = await gTranslateV3.detectLanguage({
    parent,
    content: text,
    mimeType: 'text/plain',
  });
  // 取最可能語言
  return resp?.languages?.[0]?.languageCode || 'auto';
}


const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function safeTranslate({ text, target = 'en' }) {
    let userTragetLang = target;
    if (!target) {
        const detected = await googleDetectV3(text).catch(() => null);
        userTragetLang = detected && detected.startsWith('zh') ? 'en' : 'zh-TW';
    }
    try {
        const g = await googleTranslateV3(text, userTragetLang);
        return { text: g, engine: 'google-v3', target }
    } catch (err) {
        const code = err?.code || err?.status;
        const reason = err?.errors?.[0]?.reason;
        console.error('[google-translate-v3-error]', { code, reason, msg: err?.message });

        const shouldDirectFallback =
            code === 403 && /userRateLimitExceeded/i.test(reason);
        if (!shouldDirectFallback) {
            // 只有在非 userRateLimitExceeded 的 429/503/一般 403 才退避重試一次
            if (code === 429 || code === 503 || code === 403) {
                await sleep(300 + Math.random() * 500);
                try {
                    const g2 = await googleTranslateV3(text, userTragetLang);
                    return { text: g2, engine: 'google-v3', userTragetLang };
                } catch { }
            }
        }
        // 其他錯誤或重試失敗都直接轉 DeepL
        try {
            const dlTarget = mapToDeepLTarget(userTragetLang);
            const result = await translateByDeepL({ text });
            return { text: result.text, engine: 'deepl', target: dlTarget };
        } catch (e2) {
            console.error('[deepl-translate-error]', { msg: e2?.message });
            return { text: '翻譯服務暫時忙碌，請稍後再試 🙏', engine: 'fallback', userTragetLang };
        }
    }
}

export async function getSupportLangs() {
    const langs = await googleGetLanguages();
    return langs; // [{ language: 'en', name: 'English' }, ...]
}