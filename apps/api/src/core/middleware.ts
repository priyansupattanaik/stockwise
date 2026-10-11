import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { AppError } from './errors';
import { Logger } from './logger';

const logger = new Logger('Middleware');
const idempotencyStore = new Map<string, { statusCode: number; payload: any }>();

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
    startTime: number;
  }
}

export function registerCoreMiddleware(app: FastifyInstance) {
  // Pre-handler: Request ID, Timing, and Idempotency
  app.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    req.startTime = Date.now();
    const incomingReqId = req.headers['x-request-id'];
    req.requestId = typeof incomingReqId === 'string' ? incomingReqId : randomUUID();
    reply.header('x-request-id', req.requestId);

    // Idempotency check for POST/PUT/PATCH/DELETE
    const idempotencyKey = req.headers['x-idempotency-key'];
    if (typeof idempotencyKey === 'string' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const cached = idempotencyStore.get(idempotencyKey);
      if (cached) {
        logger.info(`Replaying response for idempotency key: ${idempotencyKey}`, undefined, req.requestId);
        reply.header('x-cache-replayed', 'true');
        return reply.status(cached.statusCode).send(cached.payload);
      }
    }
  });

  // Post-handler to cache idempotent responses
  app.addHook('onSend', async (req: FastifyRequest, reply: FastifyReply, payload: any) => {
    const idempotencyKey = req.headers['x-idempotency-key'];
    if (typeof idempotencyKey === 'string' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      try {
        const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
        idempotencyStore.set(idempotencyKey, {
          statusCode: reply.statusCode,
          payload: parsed,
        });
      } catch {
        // payload is not json
      }
    }
    return payload;
  });

  // Error Handler Hook
  app.setErrorHandler((error: Error, req: FastifyRequest, reply: FastifyReply) => {
    const reqId = req.requestId || randomUUID();
    const durationMs = req.startTime ? Date.now() - req.startTime : 0;

    if (error instanceof AppError) {
      logger.warn(
        `Handled AppError [${error.code}]: ${error.message} (${durationMs}ms)`,
        { code: error.code, details: error.details },
        reqId
      );
      return reply.status(error.statusCode).send(error.toEnvelope(reqId));
    }

    // Fastify schema validation error
    if ('validation' in error && Array.isArray((error as any).validation)) {
      const details = (error as any).validation.map((v: any) => ({
        code: 'SCHEMA_VALIDATION',
        message: v.message,
        field: v.instancePath,
      }));
      logger.warn(`Fastify validation error (${durationMs}ms)`, { details }, reqId);
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request payload validation failed.',
          details,
          requestId: reqId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Unhandled internal server error
    logger.error(`Unhandled internal error: ${error.message}`, error, reqId);
    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
        requestId: reqId,
        timestamp: new Date().toISOString(),
      },
    });
  });
}
