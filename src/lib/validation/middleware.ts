// Validation Utilities (Client-side compatible)
import { z, ZodSchema } from 'zod';
import { formatValidationError } from './schemas';

/**
 * Validate data against Zod schema
 */
export function validateData<T>(schema: ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as unknown as T;
  }

  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
      }
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Validate and sanitize data
 */
export function validateAndSanitize<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ReturnType<typeof formatValidationError> } {
  const result = validateData(schema, data);

  if (!result.success) {
    return {
      success: false,
      error: formatValidationError(result.error),
    };
  }

  return {
    success: true,
    data: sanitizeObject(result.data),
  };
}

