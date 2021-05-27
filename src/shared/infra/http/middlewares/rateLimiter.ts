import { Request, Response, NextFunction } from 'express';
import redis from 'redis';
import AppError from '@shared/errors/AppError';
import  { RateLimiterRedis } from 'rate-limiter-flexible';

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASS || undefined
});

const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'ratelimit',
    points: 3,
    duration: 1
});

export default async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await limiter.consume(req.ip);

        return next();
    } catch (err) {
        throw new AppError('Ops, excesso de requisições!', 429);
    }
};
