export const TRANSLATE_LANG_MAP = {
    "BG": "Bulgarian",
    "CS": "Czech",
    "DA": "Danish",
    "DE": "German",
    "EL": "Greek",
    "EN-GB": "English (British)",
    "EN-US": "English (American)",
    "ES": "Spanish",
    "ET": "Estonian",
    "FI": "Finnish",
    "FR": "French",
    "HU": "Hungarian",
    "ID": "Indonesian",
    "IT": "Italian",
    "JA": "Japanese",
    "KO": "Korean",
    "LT": "Lithuanian",
    "LV": "Latvian",
    "NB": "Norwegian (Bokmål)",
    "NL": "Dutch",
    "PL": "Polish",
    "PT": "Portuguese (all Portuguese varieties mixed)",
    "RO": "Romanian",
    "RU": "Russian",
    "SK": "Slovak",
    "SL": "Slovenian",
    "SV": "Swedish",
    "TR": "Turkish",
    "UK": "Ukrainian",
    "ZH": "Chinese",
};

export const LINE_CHANNEL_CONFIG = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
}

export const TRANSLATE_AUTH_TOKEN = {
    deepL: process.env.DEEPL_AUTH_TOKEN,
    google: process.env.GOOGLE_API_KEY,
}

export const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJ_ID;

export const MSG_KEYWORD_LIST = {
    LANGUAGE: '/lang',
    USAGE: '/usage',
    HELP: '/help',
}

export const REDIS_ALIVE_SECONDS = 60;