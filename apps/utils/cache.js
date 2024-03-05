import client from "#utils/redis.js";
import { REDIS_ALIVE_SECONDS } from '#constants/index.js'

export const getValue = async (key) => {
    const value = await client.get(key);
    return value;
}

export const setValue = async (key, value) => {
    console.log(`[cache] set: "${key}: ${value}"`)
    await client.set(key, value, {
        EX: REDIS_ALIVE_SECONDS,
        NX: true
    });
}

export const getDictField = async (key, field) => {
    return await client.hGet(key, field);
}

export const getDict = async (key) => {
    return await client.hGetAll(key);
}

export const setDict = async (key, obj) => {
    console.log(`[cache] set: "${key}: ${JSON.stringify(obj)}"`)
    await client.hSet(key, obj, {
        EX: REDIS_ALIVE_SECONDS,
        NX: true
    });
}
