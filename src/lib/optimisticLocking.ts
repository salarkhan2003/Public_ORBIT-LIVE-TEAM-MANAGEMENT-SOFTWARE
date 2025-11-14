// Optimistic Locking Implementation
import { SupabaseClient } from '@supabase/supabase-js';

export interface OptimisticUpdateResult<T> {
  success: boolean;
  data?: T;
  currentVersion?: number;
  conflict?: boolean;
  message?: string;
}

export class OptimisticLockError extends Error {
  constructor(
    message: string,
    public readonly currentVersion: number,
    public readonly currentData: any
  ) {
    super(message);
    this.name = 'OptimisticLockError';
  }
}

/**
 * Perform optimistic update with version checking
 */
export async function optimisticUpdate<T>(
  supabase: SupabaseClient,
  table: string,
  id: string,
  expectedVersion: number,
  updates: Partial<T>
): Promise<OptimisticUpdateResult<T>> {
  try {
    // Attempt update with version check
    const { data, error, count } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .eq('version', expectedVersion)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // If no rows updated, there's a conflict
    if (count === 0 || !data) {
      // Fetch current version
      const { data: current, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return {
        success: false,
        conflict: true,
        currentVersion: current.version,
        data: current,
        message: `Conflict detected. Current version is ${current.version}, expected ${expectedVersion}`,
      };
    }

    return {
      success: true,
      data: data as T,
      currentVersion: data.version,
    };
  } catch (error) {
    console.error('Optimistic update error:', error);
    throw error;
  }
}

/**
 * Retry optimistic update with exponential backoff
 */
export async function retryOptimisticUpdate<T>(
  supabase: SupabaseClient,
  table: string,
  id: string,
  updateFn: (current: T) => Partial<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<OptimisticUpdateResult<T>> {
  const {
    maxRetries = 3,
    baseDelay = 100,
    maxDelay = 1000,
  } = options;

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Fetch current version
      const { data: current, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Generate updates based on current data
      const updates = updateFn(current as T);

      // Attempt optimistic update
      const result = await optimisticUpdate<T>(
        supabase,
        table,
        id,
        current.version,
        updates
      );

      if (result.success) {
        return result;
      }

      // Conflict detected, retry with backoff
      attempt++;
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      attempt++;
    }
  }

  // Max retries exceeded
  const { data: final } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  return {
    success: false,
    conflict: true,
    currentVersion: final?.version,
    data: final,
    message: `Max retries (${maxRetries}) exceeded`,
  };
}

/**
 * Check for version conflict before update
 */
export async function checkVersionConflict(
  supabase: SupabaseClient,
  table: string,
  id: string,
  expectedVersion: number
): Promise<{
  hasConflict: boolean;
  currentVersion?: number;
  currentData?: any;
}> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  const hasConflict = data.version !== expectedVersion;

  return {
    hasConflict,
    currentVersion: data.version,
    currentData: hasConflict ? data : undefined,
  };
}

/**
 * Batch optimistic update with transaction-like behavior
 */
export async function batchOptimisticUpdate<T>(
  supabase: SupabaseClient,
  updates: Array<{
    table: string;
    id: string;
    version: number;
    data: Partial<T>;
  }>
): Promise<{
  success: boolean;
  results: Array<OptimisticUpdateResult<T>>;
  conflicts: Array<{
    index: number;
    currentVersion: number;
    currentData: any;
  }>;
}> {
  const results: Array<OptimisticUpdateResult<T>> = [];
  const conflicts: Array<any> = [];

  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    const result = await optimisticUpdate<T>(
      supabase,
      update.table,
      update.id,
      update.version,
      update.data
    );

    results.push(result);

    if (result.conflict) {
      conflicts.push({
        index: i,
        currentVersion: result.currentVersion,
        currentData: result.data,
      });
    }
  }

  return {
    success: conflicts.length === 0,
    results,
    conflicts,
  };
}

/**
 * React hook for optimistic updates
 */
export function useOptimisticUpdate() {
  const handleUpdate = async <T,>(
    supabase: SupabaseClient,
    table: string,
    id: string,
    version: number,
    updates: Partial<T>,
    onSuccess?: (data: T) => void,
    onConflict?: (currentData: T, currentVersion: number) => void
  ) => {
    const result = await optimisticUpdate<T>(
      supabase,
      table,
      id,
      version,
      updates
    );

    if (result.success && result.data) {
      onSuccess?.(result.data);
      return result.data;
    } else if (result.conflict && result.data) {
      onConflict?.(result.data, result.currentVersion!);
      throw new OptimisticLockError(
        result.message || 'Version conflict',
        result.currentVersion!,
        result.data
      );
    }
  };

  return { handleUpdate };
}

/**
 * Merge conflicts automatically
 */
export function mergeConflicts<T extends Record<string, any>>(
  base: T,
  local: Partial<T>,
  remote: T
): T {
  const merged: any = { ...remote };

  // For each local change, check if it conflicts with remote
  for (const key in local) {
    if (local.hasOwnProperty(key)) {
      const baseValue = base[key];
      const localValue = local[key];
      const remoteValue = remote[key];

      // If remote didn't change this field, use local change
      if (baseValue === remoteValue) {
        merged[key] = localValue;
      }
      // If both changed to the same value, use either
      else if (localValue === remoteValue) {
        merged[key] = localValue;
      }
      // Conflict: remote changed, use remote (or implement custom merge logic)
      else {
        // Keep remote value by default
        // You can implement custom merge strategies here
        merged[key] = remoteValue;
      }
    }
  }

  return merged as T;
}

