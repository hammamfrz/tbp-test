import { createClient, RedisClientOptions } from 'redis';

interface CustomRedisClientOptions extends RedisClientOptions {
  host: string;
}

export const redisProviders = [
  {
    provide: 'REDIS',
    useFactory: async () => {
      const client = createClient({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
      } as CustomRedisClientOptions);
      client.on('error', (err) => console.error('Redis Client Error', err));
      await client.connect();
      return client;
    },
  },
];
