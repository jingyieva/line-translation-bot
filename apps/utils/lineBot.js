import { messagingApi, middleware } from '@line/bot-sdk';

import { LINE_CHANNEL_CONFIG } from '../constants/index.js';

const { MessagingApiClient } = messagingApi;
export const client = new MessagingApiClient({
    channelAccessToken: LINE_CHANNEL_CONFIG.channelAccessToken
});

export const lineMiddleware = middleware;