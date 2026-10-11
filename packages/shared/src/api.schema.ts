import { z } from 'zod';

export const ApiSuccessEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        requestId: z.string(),
        timestamp: z.string(),
        durationMs: z.number().optional(),
        isStale: z.boolean().optional(),
        cached: z.boolean().optional(),
      })
      .optional(),
  });

export const PaginationMetaSchema = z.object({
  nextCursor: z.string().nullable().optional(),
  prevCursor: z.string().nullable().optional(),
  hasMore: z.boolean(),
  totalCount: z.number().optional(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const ApiPaginatedEnvelopeSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: PaginationMetaSchema,
    meta: z
      .object({
        requestId: z.string(),
        timestamp: z.string(),
        isStale: z.boolean().optional(),
      })
      .optional(),
  });

export const ApiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
});

export const ApiErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum([
      'VALIDATION_ERROR',
      'NOT_FOUND',
      'PROVIDER_ERROR',
      'RATE_LIMIT_EXCEEDED',
      'UNAUTHORIZED',
      'INSUFFICIENT_DATA',
      'INTERNAL_SERVER_ERROR',
    ]),
    message: z.string(),
    details: z.array(ApiErrorDetailSchema).optional(),
    requestId: z.string(),
    timestamp: z.string(),
  }),
});

export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

export const CursorPaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CursorPaginationQuery = z.infer<typeof CursorPaginationQuerySchema>;
