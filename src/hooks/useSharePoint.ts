// SharePoint Data Hooks
// This file provides React hooks for interacting with SharePoint data

import { useState, useEffect, useCallback, useRef } from 'react';
import { sharePointClient, SharePointResponse, SharePointListResponse, SharePointItem } from '../utils/sharepoint';
import { sharePointConnectionManager, ConnectionStatus } from '../services/sharepointConnection';
import { SharePointErrorHandler, AppError } from '../utils/errorHandler';
import { Survey, SurveyResponse } from '../utils/types';

// Generic hook for SharePoint data fetching
export function useSharePointData<T>(
  fetchFn: () => Promise<SharePointResponse<T>>,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: AppError) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const { enabled = true, refetchInterval, onSuccess, onError } = options;
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await sharePointConnectionManager.executeWithConnectionCheck(fetchFn);

      if (result.error) {
        const appError = SharePointErrorHandler.parseSharePointError({ message: result.error, status: result.status });
        setError(appError);
        onError?.(appError);
      } else if (result.data) {
        setData(result.data);
        setLastFetched(new Date());
        onSuccess?.(result.data);
      }
    } catch (exception) {
      const appError = SharePointErrorHandler.fromException(exception);
      setError(appError);
      onError?.(appError);
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchFn, onSuccess, onError]);

  useEffect(() => {
    fetchData();

    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, refetchInterval]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastFetched,
    refetch
  };
}

// Hook for fetching surveys
export function useSurveys(options?: {
  filter?: string;
  top?: number;
  enabled?: boolean;
}) {
  return useSharePointData<SharePointListResponse>(
    () => sharePointClient.getSurveys(options),
    {
      enabled: options?.enabled !== false,
      refetchInterval: 300000 // 5 minutes
    }
  );
}

// Hook for fetching a single survey
export function useSurvey(id: number | null, options?: {
  enabled?: boolean;
}) {
  return useSharePointData<SharePointItem>(
    () => sharePointClient.getSurvey(id!),
    {
      enabled: options?.enabled !== false && id !== null,
      refetchInterval: 300000 // 5 minutes
    }
  );
}

// Hook for fetching responses
export function useResponses(options?: {
  surveyId?: string;
  filter?: string;
  top?: number;
  enabled?: boolean;
}) {
  return useSharePointData<SharePointListResponse>(
    () => sharePointClient.getResponses(options),
    {
      enabled: options?.enabled !== false,
      refetchInterval: 60000 // 1 minute
    }
  );
}

// Hook for fetching a single response
export function useResponse(id: number | null, options?: {
  enabled?: boolean;
}) {
  return useSharePointData<SharePointItem>(
    () => sharePointClient.getResponse(id!),
    {
      enabled: options?.enabled !== false && id !== null
    }
  );
}

// Hook for creating data
export function useCreateData<T extends SharePointItem>(
  listName: string,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: AppError) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const create = useCallback(async (item: Omit<T, 'Id'>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await sharePointConnectionManager.executeWithConnectionCheck(() =>
        sharePointClient.addItem(listName, item)
      );

      if (result.error) {
        const appError = SharePointErrorHandler.parseSharePointError({ message: result.error, status: result.status });
        setError(appError);
        options?.onError?.(appError);
        return null;
      }

      options?.onSuccess?.(result.data as T);
      return result.data as T;
    } catch (exception) {
      const appError = SharePointErrorHandler.fromException(exception);
      setError(appError);
      options?.onError?.(appError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [listName, options]);

  return { create, loading, error };
}

// Hook for updating data
export function useUpdateData<T extends SharePointItem>(
  listName: string,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: AppError) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const update = useCallback(async (id: number, item: Partial<T>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await sharePointConnectionManager.executeWithConnectionCheck(() =>
        sharePointClient.updateItem(listName, id, item)
      );

      if (result.error) {
        const appError = SharePointErrorHandler.parseSharePointError({ message: result.error, status: result.status });
        setError(appError);
        options?.onError?.(appError);
        return null;
      }

      options?.onSuccess?.(result.data as T);
      return result.data as T;
    } catch (exception) {
      const appError = SharePointErrorHandler.fromException(exception);
      setError(appError);
      options?.onError?.(appError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [listName, options]);

  return { update, loading, error };
}

// Hook for deleting data
export function useDeleteData(
  listName: string,
  options?: {
    onSuccess?: () => void;
    onError?: (error: AppError) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await sharePointConnectionManager.executeWithConnectionCheck(() =>
        sharePointClient.deleteItem(listName, id)
      );

      if (result.error) {
        const appError = SharePointErrorHandler.parseSharePointError({ message: result.error, status: result.status });
        setError(appError);
        options?.onError?.(appError);
        return false;
      }

      options?.onSuccess?.();
      return true;
    } catch (exception) {
      const appError = SharePointErrorHandler.fromException(exception);
      setError(appError);
      options?.onError?.(appError);
      return false;
    } finally {
      setLoading(false);
    }
  }, [listName, options]);

  return { remove, loading, error };
}

// Hook for connection status
export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(() =>
    sharePointConnectionManager.getConnectionStatus()
  );

  useEffect(() => {
    const handleStatusChange = (event: CustomEvent<ConnectionStatus>) => {
      setStatus(event.detail);
    };

    window.addEventListener('sharepoint-connection-status', handleStatusChange as EventListener);

    return () => {
      window.removeEventListener('sharepoint-connection-status', handleStatusChange as EventListener);
    };
  }, []);

  const testConnection = useCallback(async () => {
    return sharePointConnectionManager.checkConnection();
  }, []);

  return {
    status,
    testConnection,
    isHealthy: sharePointConnectionManager.isHealthy()
  };
}

// Hook for batch operations
export function useBatchOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const executeBatch = useCallback(async (requests: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await sharePointConnectionManager.executeWithConnectionCheck(() =>
        sharePointClient.executeBatch(requests)
      );

      if (result instanceof Error) {
        const appError = SharePointErrorHandler.fromException(result);
        setError(appError);
        return null;
      }

      return result;
    } catch (exception) {
      const appError = SharePointErrorHandler.fromException(exception);
      setError(appError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { executeBatch, loading, error };
}