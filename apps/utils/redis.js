import redis from 'redis';

const client = redis.createClient();

await client.connect();

client.on('connect', () => {
    console.log('[Redis] client connected');
});

export default client;