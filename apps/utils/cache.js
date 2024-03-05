import client from "#utils/redis.js";

export const getValue = async (key) => {
    const value = await client.get(key);
    return value;
}

export const setValue = async (key, value) => {
    console.log(`[cache] set: { ${key}: ${value}}`)
    await client.set(key, value);
}

export const getDictField = async (key, field) => {
    return await client.hGet(key, field);
}

export const getDict = async (key) => {
    return await client.hGetAll(key);
}

export const setDict = async (key, obj) => {
    console.log(`[cache] set: { ${key}: ${JSON.stringify(obj)}}`)
    await client.hSet(key, obj);
}
